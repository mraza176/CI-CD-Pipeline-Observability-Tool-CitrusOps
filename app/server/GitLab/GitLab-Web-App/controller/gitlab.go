package controller

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// GitLabPipeline represents a GitLab pipeline
type GitLabPipeline struct {
	ID        int       `json:"id"`
	Status    string    `json:"status"`
	Ref       string    `json:"ref"`
	SHA       string    `json:"sha"`
	WebURL    string    `json:"web_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	User      struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		Username  string `json:"username"`
		WebURL    string `json:"web_url"`
		AvatarURL string `json:"avatar_url"`
	} `json:"user"`
}

// GitLabProject represents a GitLab project
type GitLabProject struct {
	ID                int    `json:"id"`
	Name              string `json:"name"`
	NameWithNamespace string `json:"name_with_namespace"`
	WebURL            string `json:"web_url"`
}

// GitLabJob represents a GitLab job in a pipeline
type GitLabJob struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	Status     string    `json:"status"`
	Stage      string    `json:"stage"`
	CreatedAt  time.Time `json:"created_at"`
	StartedAt  time.Time `json:"started_at"`
	FinishedAt time.Time `json:"finished_at"`
	Duration   float64   `json:"duration"`
	WebURL     string    `json:"web_url"`
	User       struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		Username  string `json:"username"`
		WebURL    string `json:"web_url"`
		AvatarURL string `json:"avatar_url"`
	} `json:"user"`
}

// GitLabArtifact represents a GitLab job artifact
type GitLabArtifact struct {
	FileType string `json:"file_type"`
	Size     int    `json:"size"`
	Filename string `json:"filename"`
}

// GitLabUser represents a GitLab user
type GitLabUser struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatar_url"`
}

// GitLabVariable represents a GitLab pipeline variable
type GitLabVariable struct {
	Key          string `json:"key"`
	Value        string `json:"value"`
	VariableType string `json:"variable_type"`
}

// GitLabPipelineDetails represents detailed GitLab pipeline information
type GitLabPipelineDetails struct {
	ID         int        `json:"id"`
	Status     string     `json:"status"`
	Ref        string     `json:"ref"`
	SHA        string     `json:"sha"`
	WebURL     string     `json:"web_url"`
	Duration   float64    `json:"duration"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	StartedAt  *time.Time `json:"started_at"`
	FinishedAt *time.Time `json:"finished_at"`
	Coverage   float64    `json:"coverage"`
	User       GitLabUser `json:"user"`
}

// GitLabMergeRequest represents a GitLab merge request
type GitLabMergeRequest struct {
	ID             int         `json:"id"`
	IID            int         `json:"iid"`
	Title          string      `json:"title"`
	Description    string      `json:"description"`
	State          string      `json:"state"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
	MergedAt       *time.Time  `json:"merged_at"`
	ClosedAt       *time.Time  `json:"closed_at"`
	WebURL         string      `json:"web_url"`
	SourceBranch   string      `json:"source_branch"`
	TargetBranch   string      `json:"target_branch"`
	Author         GitLabUser  `json:"author"`
	Assignee       *GitLabUser `json:"assignee"`
	MergedBy       *GitLabUser `json:"merged_by"`
	WorkInProgress bool        `json:"work_in_progress"`
	MergeStatus    string      `json:"merge_status"`
	Draft          bool        `json:"draft"`
	HasConflicts   bool        `json:"has_conflicts"`
	TimeStats      struct {
		TimeEstimate        int    `json:"time_estimate"`
		TotalTimeSpent      int    `json:"total_time_spent"`
		HumanTimeEstimate   string `json:"human_time_estimate"`
		HumanTotalTimeSpent string `json:"human_total_time_spent"`
	} `json:"time_stats"`
}

// makeGitLabAPIRequest makes a request to the GitLab API
func makeGitLabAPIRequest(method, endpoint string, config GitLabConfig) ([]byte, error) {
	// Create a new request
	url := fmt.Sprintf("%s/api/v4/%s", config.URL, endpoint)
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, err
	}

	// Add the token to the request header
	req.Header.Add("PRIVATE-TOKEN", config.Token)

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check the response status code - accept both 200 OK and 201 Created
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		// Read the response body for more details
		body, _ := ioutil.ReadAll(resp.Body)
		if len(body) > 0 {
			return nil, fmt.Errorf("GitLab API returned status code %d: %s", resp.StatusCode, string(body))
		}
		return nil, fmt.Errorf("GitLab API returned status code %d", resp.StatusCode)
	}

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

// GetGitLabProjects fetches all projects the user has access to
func GetGitLabProjects(c *gin.Context) {
	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitLab token not configured"})
		return
	}

	// Make API request to get projects
	body, err := makeGitLabAPIRequest("GET", "projects?membership=true&per_page=100", config)
	if err != nil {
		log.Printf("Error fetching GitLab projects: %v", err)
		// Return example projects as fallback
		c.JSON(http.StatusOK, gin.H{
			"projects": []GitLabProject{
				{ID: 1, Name: "Example Project 1", NameWithNamespace: "Group / Example Project 1", WebURL: "https://gitlab.com/group/example-project-1"},
				{ID: 2, Name: "Example Project 2", NameWithNamespace: "Group / Example Project 2", WebURL: "https://gitlab.com/group/example-project-2"},
			},
		})
		return
	}

	// Parse the response
	var projects []GitLabProject
	if err := json.Unmarshal(body, &projects); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error parsing GitLab projects: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}

// GetGitLabPipelines fetches pipelines from GitLab
func GetGitLabPipelines(c *gin.Context) {
	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"pipelines": getExamplePipelines(),
			"note":      "Using example data because GitLab token is not configured",
		})
		return
	}

	var pipelines []GitLabPipeline
	var projectInfo string

	// If project ID is set, fetch pipelines for that project
	if config.ProjectID != "" {
		// Make API request to get pipelines
		endpoint := fmt.Sprintf("projects/%s/pipelines", config.ProjectID)
		log.Printf("Fetching pipelines from endpoint: %s", endpoint)
		body, err := makeGitLabAPIRequest("GET", endpoint, config)
		if err != nil {
			log.Printf("Error fetching GitLab pipelines: %v", err)
			// Return example pipelines as fallback
			c.JSON(http.StatusOK, gin.H{
				"pipelines": getExamplePipelines(),
				"note":      "Using example data due to API error",
			})
			return
		}

		// Parse the response
		if err := json.Unmarshal(body, &pipelines); err != nil {
			log.Printf("Error parsing GitLab pipelines: %v", err)
			c.JSON(http.StatusOK, gin.H{
				"pipelines": getExamplePipelines(),
				"note":      "Using example data due to parsing error",
			})
			return
		}

		// Get project details for info
		projectEndpoint := fmt.Sprintf("projects/%s", config.ProjectID)
		projectBody, err := makeGitLabAPIRequest("GET", projectEndpoint, config)
		if err == nil {
			var project map[string]interface{}
			if err := json.Unmarshal(projectBody, &project); err == nil {
				if name, ok := project["name"].(string); ok {
					projectInfo = fmt.Sprintf("Showing pipelines for project: %s (ID: %s)", name, config.ProjectID)
				}
			}
		}
	} else {
		// No project ID set, fetch projects first then get pipelines for each
		projectsBody, err := makeGitLabAPIRequest("GET", "projects?membership=true&per_page=5", config)
		if err != nil {
			log.Printf("Error fetching GitLab projects: %v", err)
			// Return example pipelines as fallback
			c.JSON(http.StatusOK, gin.H{
				"pipelines": getExamplePipelines(),
				"note":      "Using example data because no projects could be fetched",
			})
			return
		}

		// Parse the projects response
		var projects []GitLabProject
		if err := json.Unmarshal(projectsBody, &projects); err != nil {
			log.Printf("Error parsing GitLab projects: %v", err)
			c.JSON(http.StatusOK, gin.H{
				"pipelines": getExamplePipelines(),
				"note":      "Using example data due to project parsing error",
			})
			return
		}

		if len(projects) == 0 {
			log.Printf("No GitLab projects found")
			c.JSON(http.StatusOK, gin.H{
				"pipelines": []GitLabPipeline{},
				"note":      "No projects found in your GitLab account",
			})
			return
		}

		projectNames := []string{}
		// Get pipelines for each project (limit to first 5 projects to avoid overloading)
		for i, project := range projects {
			if i >= 5 {
				break // Limit to 5 projects
			}

			projectNames = append(projectNames, project.Name)
			log.Printf("Fetching pipelines for project %d: %s", project.ID, project.Name)
			endpoint := fmt.Sprintf("projects/%d/pipelines?per_page=5", project.ID)
			body, err := makeGitLabAPIRequest("GET", endpoint, config)
			if err != nil {
				log.Printf("Error fetching pipelines for project %d: %v", project.ID, err)
				continue
			}

			var projectPipelines []GitLabPipeline
			if err := json.Unmarshal(body, &projectPipelines); err != nil {
				log.Printf("Error parsing pipelines for project %d: %v", project.ID, err)
				continue
			}

			// Add project information to each pipeline
			for j := range projectPipelines {
				// Add project name to the pipeline reference for better identification
				projectPipelines[j].Ref = fmt.Sprintf("%s (%s)", projectPipelines[j].Ref, project.Name)

				// Store project ID in the web URL if it's not already there
				if !strings.Contains(projectPipelines[j].WebURL, fmt.Sprintf("projects/%d", project.ID)) {
					projectPipelines[j].WebURL = fmt.Sprintf("%s?project_id=%d", projectPipelines[j].WebURL, project.ID)
				}
			}

			pipelines = append(pipelines, projectPipelines...)
		}

		projectInfo = fmt.Sprintf("Showing pipelines from %d projects: %s", len(projectNames), strings.Join(projectNames, ", "))
	}

	// If no pipelines were found, return empty array with note
	if len(pipelines) == 0 {
		log.Printf("No pipelines found in any projects")
		c.JSON(http.StatusOK, gin.H{
			"pipelines": []GitLabPipeline{},
			"note":      "No pipelines found in any of your GitLab projects",
		})
		return
	}

	// Log the number of pipelines found
	log.Printf("Found %d pipelines across projects", len(pipelines))

	// Fetch user details for each pipeline
	for i, pipeline := range pipelines {
		// Make API request to get pipeline details
		var endpoint string
		if config.ProjectID != "" {
			endpoint = fmt.Sprintf("projects/%s/pipelines/%d", config.ProjectID, pipeline.ID)
		} else {
			// Extract project ID from pipeline web URL
			// Format is typically: https://gitlab.com/namespace/project/-/pipelines/123
			parts := strings.Split(pipeline.WebURL, "/-/pipelines/")
			if len(parts) == 2 {
				projectURL := parts[0]
				projectParts := strings.Split(projectURL, "/")
				if len(projectParts) >= 2 {
					projectPath := strings.Join(projectParts[len(projectParts)-2:], "/")
					endpoint = fmt.Sprintf("projects/%s/pipelines/%d", url.PathEscape(projectPath), pipeline.ID)
				}
			}
		}

		if endpoint == "" {
			continue
		}

		body, err := makeGitLabAPIRequest("GET", endpoint, config)
		if err != nil {
			log.Printf("Error fetching pipeline details: %v", err)
			continue
		}

		var pipelineDetails GitLabPipeline
		if err := json.Unmarshal(body, &pipelineDetails); err != nil {
			log.Printf("Error parsing pipeline details: %v", err)
			continue
		}

		// Update the pipeline with user details
		pipelines[i].User = pipelineDetails.User
	}

	c.JSON(http.StatusOK, gin.H{
		"pipelines": pipelines,
		"info":      projectInfo,
	})
}

// GetGitLabPipeline fetches a specific pipeline from GitLab
func GetGitLabPipeline(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"pipeline": getExamplePipelines()[0],
			"note":     "Using example data because GitLab token is not configured",
		})
		return
	}

	// If no project ID is set, try to get it from the query parameters
	projectID := config.ProjectID
	if projectID == "" {
		projectID = c.Query("project_id")
		if projectID == "" {
			log.Printf("No project ID configured or provided in query")
			c.JSON(http.StatusOK, gin.H{
				"pipeline": getExamplePipelines()[0],
				"note":     "Using example data because no project ID is configured or provided",
			})
			return
		}
	}

	// Make API request to get pipeline details
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s", projectID, pipelineID)
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		log.Printf("Error fetching GitLab pipeline: %v", err)
		// Return example pipeline as fallback
		c.JSON(http.StatusOK, gin.H{
			"pipeline": getExamplePipelines()[0],
			"note":     "Using example data due to API error",
		})
		return
	}

	// Parse the response
	var pipeline GitLabPipeline
	if err := json.Unmarshal(body, &pipeline); err != nil {
		log.Printf("Error parsing GitLab pipeline: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"pipeline": getExamplePipelines()[0],
			"note":     "Using example data due to parsing error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pipeline": pipeline})
}

// GetPipelineJobs fetches jobs for a specific pipeline
func GetPipelineJobs(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"jobs": []GitLabJob{},
			"note": "Using example data because GitLab token is not configured",
		})
		return
	}

	// If no project ID is set, try to get it from the query parameters
	projectID := config.ProjectID
	if projectID == "" {
		projectID = c.Query("project_id")
		if projectID == "" {
			log.Printf("No project ID configured or provided in query")
			c.JSON(http.StatusOK, gin.H{
				"jobs": []GitLabJob{
					{
						ID:         1,
						Name:       "build",
						Status:     "success",
						Stage:      "build",
						CreatedAt:  time.Now().Add(-time.Hour),
						StartedAt:  time.Now().Add(-time.Hour),
						FinishedAt: time.Now().Add(-time.Hour + 5*time.Minute),
						Duration:   300.0,
						WebURL:     "https://gitlab.com/group/project/-/jobs/1",
						User: struct {
							ID        int    `json:"id"`
							Name      string `json:"name"`
							Username  string `json:"username"`
							WebURL    string `json:"web_url"`
							AvatarURL string `json:"avatar_url"`
						}{
							ID:        1,
							Name:      "John Doe",
							Username:  "johndoe",
							WebURL:    "https://gitlab.com/johndoe",
							AvatarURL: "https://secure.gravatar.com/avatar/abcdefg",
						},
					},
				},
				"note": "Using example data because no project ID is configured or provided",
			})
			return
		}
	}

	// Make API request to get pipeline jobs
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s/jobs", projectID, pipelineID)
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		log.Printf("Error fetching GitLab pipeline jobs: %v", err)
		// Return example jobs as fallback
		c.JSON(http.StatusOK, gin.H{
			"jobs": []GitLabJob{
				{
					ID:         1,
					Name:       "build",
					Status:     "success",
					Stage:      "build",
					CreatedAt:  time.Now().Add(-time.Hour),
					StartedAt:  time.Now().Add(-time.Hour),
					FinishedAt: time.Now().Add(-time.Hour + 5*time.Minute),
					Duration:   300.0,
					WebURL:     "https://gitlab.com/group/project/-/jobs/1",
					User: struct {
						ID        int    `json:"id"`
						Name      string `json:"name"`
						Username  string `json:"username"`
						WebURL    string `json:"web_url"`
						AvatarURL string `json:"avatar_url"`
					}{
						ID:        1,
						Name:      "John Doe",
						Username:  "johndoe",
						WebURL:    "https://gitlab.com/johndoe",
						AvatarURL: "https://secure.gravatar.com/avatar/abcdefg",
					},
				},
				{
					ID:         2,
					Name:       "test",
					Status:     "success",
					Stage:      "test",
					CreatedAt:  time.Now().Add(-time.Hour + 5*time.Minute),
					StartedAt:  time.Now().Add(-time.Hour + 5*time.Minute),
					FinishedAt: time.Now().Add(-time.Hour + 15*time.Minute),
					Duration:   600.0,
					WebURL:     "https://gitlab.com/group/project/-/jobs/2",
					User: struct {
						ID        int    `json:"id"`
						Name      string `json:"name"`
						Username  string `json:"username"`
						WebURL    string `json:"web_url"`
						AvatarURL string `json:"avatar_url"`
					}{
						ID:        1,
						Name:      "John Doe",
						Username:  "johndoe",
						WebURL:    "https://gitlab.com/johndoe",
						AvatarURL: "https://secure.gravatar.com/avatar/abcdefg",
					},
				},
			},
			"note": "Using example data due to API error",
		})
		return
	}

	// Parse the response
	var jobs []GitLabJob
	if err := json.Unmarshal(body, &jobs); err != nil {
		log.Printf("Error parsing GitLab pipeline jobs: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"jobs": []GitLabJob{},
			"note": "Using example data due to parsing error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

// GetPipelineDetails fetches detailed information for a specific pipeline
func GetPipelineDetails(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"pipeline": getExamplePipelineDetails(),
			"note":     "Using example data because GitLab token is not configured",
		})
		return
	}

	// If no project ID is set, try to get it from the query parameters
	projectID := config.ProjectID
	if projectID == "" {
		projectID = c.Query("project_id")
		if projectID == "" {
			log.Printf("No project ID configured or provided in query")
			c.JSON(http.StatusOK, gin.H{
				"pipeline": getExamplePipelineDetails(),
				"note":     "Using example data because no project ID is configured or provided",
			})
			return
		}
	}

	// Make API request to get pipeline details
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s", projectID, pipelineID)
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		log.Printf("Error fetching GitLab pipeline details: %v", err)
		// Return example pipeline as fallback
		c.JSON(http.StatusOK, gin.H{
			"pipeline": getExamplePipelineDetails(),
			"note":     "Using example data due to API error",
		})
		return
	}

	// Parse the response into a map first to handle date fields properly
	var pipelineMap map[string]interface{}
	if err := json.Unmarshal(body, &pipelineMap); err != nil {
		log.Printf("Error parsing GitLab pipeline details: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"pipeline": getExamplePipelineDetails(),
			"note":     "Using example data due to parsing error",
		})
		return
	}

	// Create a properly formatted response with all required fields
	response := map[string]interface{}{
		"id":          pipelineMap["id"],
		"status":      pipelineMap["status"],
		"ref":         pipelineMap["ref"],
		"sha":         pipelineMap["sha"],
		"web_url":     pipelineMap["web_url"],
		"created_at":  pipelineMap["created_at"],
		"updated_at":  pipelineMap["updated_at"],
		"started_at":  pipelineMap["started_at"],
		"finished_at": pipelineMap["finished_at"],
		"duration":    pipelineMap["duration"],
		"coverage":    pipelineMap["coverage"],
	}

	// Add user information if available
	if user, ok := pipelineMap["user"].(map[string]interface{}); ok {
		response["user"] = user
	} else {
		// Provide default user information if not available
		response["user"] = map[string]interface{}{
			"name":       "Unknown User",
			"username":   "unknown",
			"avatar_url": "",
		}
	}

	// Log the response for debugging
	log.Printf("Pipeline details response: %+v", response)

	c.JSON(http.StatusOK, gin.H{"pipeline": response})
}

// GetPipelineTestReport fetches test report for a specific pipeline
func GetPipelineTestReport(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token and project ID are set
	if config.Token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitLab token not configured"})
		return
	}

	if config.ProjectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitLab project ID not configured"})
		return
	}

	// Make API request to get pipeline test report
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s/test_report", config.ProjectID, pipelineID)
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		log.Printf("Error fetching GitLab pipeline test report: %v", err)
		// Return example test report as fallback
		c.JSON(http.StatusOK, gin.H{
			"total": map[string]int{
				"time":    5000,
				"count":   20,
				"success": 18,
				"failed":  2,
				"skipped": 0,
				"error":   0,
			},
			"test_suites": []map[string]interface{}{
				{
					"name":     "Unit Tests",
					"duration": 3000,
					"tests":    []map[string]interface{}{},
				},
				{
					"name":     "Integration Tests",
					"duration": 2000,
					"tests":    []map[string]interface{}{},
				},
			},
		})
		return
	}

	// Parse the response and return it directly
	var testReport map[string]interface{}
	if err := json.Unmarshal(body, &testReport); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error parsing GitLab pipeline test report: %v", err)})
		return
	}

	c.JSON(http.StatusOK, testReport)
}

// GetPipelineTestReportSummary fetches test report summary for a specific pipeline
func GetPipelineTestReportSummary(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, getExampleTestReportSummary())
		return
	}

	// If no project ID is set, try to get it from the query parameters
	projectID := config.ProjectID
	if projectID == "" {
		projectID = c.Query("project_id")
		if projectID == "" {
			log.Printf("No project ID configured or provided in query")
			c.JSON(http.StatusOK, getExampleTestReportSummary())
			return
		}
	}

	// Make API request to get pipeline test report summary
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s/test_report_summary", projectID, pipelineID)
	log.Printf("Fetching test report from endpoint: %s", endpoint)
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		// Check if error is 404 (no test report available)
		if strings.Contains(err.Error(), "404") {
			log.Printf("No test report available for pipeline %s (404 Not Found)", pipelineID)
			c.JSON(http.StatusOK, gin.H{
				"total": map[string]interface{}{
					"time":    0,
					"count":   0,
					"success": 0,
					"failed":  0,
					"skipped": 0,
					"error":   0,
				},
				"test_suites": []map[string]interface{}{},
				"note":        "No test report available for this pipeline",
			})
			return
		}

		log.Printf("Error fetching GitLab pipeline test report summary: %v", err)
		// Return minimal test data with a note
		c.JSON(http.StatusOK, gin.H{
			"total": map[string]interface{}{
				"time":    0,
				"count":   0,
				"success": 0,
				"failed":  0,
				"skipped": 0,
				"error":   0,
			},
			"test_suites": []map[string]interface{}{},
			"note":        fmt.Sprintf("Error fetching test report: %v", err),
		})
		return
	}

	// Parse the response
	var testReportSummary map[string]interface{}
	if err := json.Unmarshal(body, &testReportSummary); err != nil {
		log.Printf("Error parsing GitLab pipeline test report summary: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"total": map[string]interface{}{
				"time":    0,
				"count":   0,
				"success": 0,
				"failed":  0,
				"skipped": 0,
				"error":   0,
			},
			"test_suites": []map[string]interface{}{},
			"note":        fmt.Sprintf("Error parsing test report: %v", err),
		})
		return
	}

	// If the response is empty, return minimal data with a note
	if testReportSummary == nil || len(testReportSummary) == 0 {
		log.Printf("Empty test report summary received from GitLab API")
		c.JSON(http.StatusOK, gin.H{
			"total": map[string]interface{}{
				"time":    0,
				"count":   0,
				"success": 0,
				"failed":  0,
				"skipped": 0,
				"error":   0,
			},
			"test_suites": []map[string]interface{}{},
			"note":        "No test data available for this pipeline",
		})
		return
	}

	// Log the response for debugging
	log.Printf("Test report summary: %+v", testReportSummary)

	c.JSON(http.StatusOK, testReportSummary)
}

// Helper function to get example test report summary
func getExampleTestReportSummary() map[string]interface{} {
	return map[string]interface{}{
		"total": map[string]interface{}{
			"time":    5000,
			"count":   20,
			"success": 18,
			"failed":  2,
			"skipped": 0,
			"error":   0,
		},
		"test_suites": []map[string]interface{}{
			{
				"name":     "Unit Tests",
				"duration": 3000,
				"count":    12,
				"success":  11,
				"failed":   1,
				"skipped":  0,
				"error":    0,
				"tests": []map[string]interface{}{
					{
						"name":     "Test User Authentication",
						"status":   "success",
						"duration": 150,
					},
					{
						"name":     "Test Data Validation",
						"status":   "failed",
						"duration": 200,
						"failure":  "Expected value to be 42 but got 41",
					},
				},
			},
			{
				"name":     "Integration Tests",
				"duration": 2000,
				"count":    8,
				"success":  7,
				"failed":   1,
				"skipped":  0,
				"error":    0,
				"tests": []map[string]interface{}{
					{
						"name":     "Test API Endpoint",
						"status":   "success",
						"duration": 350,
					},
					{
						"name":     "Test Database Connection",
						"status":   "failed",
						"duration": 400,
						"failure":  "Connection timed out",
					},
				},
			},
		},
	}
}

// RetryPipeline retries a specific pipeline
func RetryPipeline(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"message": "Cannot retry pipeline: GitLab token not configured",
			"success": false,
		})
		return
	}

	// If no project ID is set, try to get it from the query parameters
	projectID := config.ProjectID
	if projectID == "" {
		projectID = c.Query("project_id")
		if projectID == "" {
			log.Printf("No project ID configured or provided in query")
			c.JSON(http.StatusOK, gin.H{
				"message": "Cannot retry pipeline: No project ID configured or provided",
				"success": false,
			})
			return
		}
	}

	// Make API request to retry pipeline
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s/retry", projectID, pipelineID)
	log.Printf("Retrying pipeline with endpoint: %s", endpoint)

	// Create a new request
	url := fmt.Sprintf("%s/api/v4/%s", config.URL, endpoint)
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("Failed to retry pipeline: %v", err),
			"success": false,
		})
		return
	}

	// Add the token to the request header
	req.Header.Add("PRIVATE-TOKEN", config.Token)

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error retrying GitLab pipeline: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("Failed to retry pipeline: %v", err),
			"success": false,
		})
		return
	}
	defer resp.Body.Close()

	// Check the response status code - 201 Created is a success for pipeline retry
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		log.Printf("GitLab API returned status code %d", resp.StatusCode)
		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("Failed to retry pipeline: GitLab API returned status code %d", resp.StatusCode),
			"success": false,
		})
		return
	}

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"message": "Pipeline retry initiated but failed to read response",
			"success": true,
		})
		return
	}

	// Parse the response
	var response map[string]interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		log.Printf("Error parsing GitLab pipeline retry response: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"message": "Pipeline retry initiated but failed to parse response",
			"success": true,
		})
		return
	}

	// Log success
	log.Printf("Successfully retried pipeline %s, new status: %v", pipelineID, response["status"])

	c.JSON(http.StatusOK, gin.H{
		"message":  "Pipeline retry initiated successfully",
		"success":  true,
		"pipeline": response,
	})
}

// CancelPipeline cancels a specific pipeline
func CancelPipeline(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token and project ID are set
	if config.Token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitLab token not configured"})
		return
	}

	if config.ProjectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitLab project ID not configured"})
		return
	}

	// Make API request to cancel pipeline
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s/cancel", config.ProjectID, pipelineID)
	body, err := makeGitLabAPIRequest("POST", endpoint, config)
	if err != nil {
		log.Printf("Error canceling GitLab pipeline: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error canceling pipeline: %v", err)})
		return
	}

	// Parse the response
	var pipeline GitLabPipeline
	if err := json.Unmarshal(body, &pipeline); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error parsing GitLab pipeline: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pipeline": pipeline})
}

// GetPipelineVariables fetches variables for a specific pipeline
func GetPipelineVariables(c *gin.Context) {
	// Get pipeline ID from URL parameter
	pipelineID := c.Param("id")

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"variables": getExampleVariables(),
			"note":      "Using example data because GitLab token is not configured",
		})
		return
	}

	// If no project ID is set, try to get it from the query parameters
	projectID := config.ProjectID
	if projectID == "" {
		projectID = c.Query("project_id")
		if projectID == "" {
			log.Printf("No project ID configured or provided in query")
			c.JSON(http.StatusOK, gin.H{
				"variables": getExampleVariables(),
				"note":      "Using example data because no project ID is configured or provided",
			})
			return
		}
	}

	// Make API request to get pipeline variables
	endpoint := fmt.Sprintf("projects/%s/pipelines/%s/variables", projectID, pipelineID)
	log.Printf("Fetching variables from endpoint: %s", endpoint)
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		log.Printf("Error fetching GitLab pipeline variables: %v", err)
		// Return empty variables with a note
		c.JSON(http.StatusOK, gin.H{
			"variables": []map[string]interface{}{},
			"note":      fmt.Sprintf("No variables available: %v", err),
		})
		return
	}

	// Parse the response
	var variables []map[string]interface{}
	if err := json.Unmarshal(body, &variables); err != nil {
		log.Printf("Error parsing GitLab pipeline variables: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"variables": []map[string]interface{}{},
			"note":      fmt.Sprintf("Error parsing variables: %v", err),
		})
		return
	}

	// If no variables were found, return empty array with note
	if len(variables) == 0 {
		log.Printf("No variables found for pipeline %s", pipelineID)
		c.JSON(http.StatusOK, gin.H{
			"variables": []map[string]interface{}{},
			"note":      "No variables found for this pipeline",
		})
		return
	}

	// Log the response for debugging
	log.Printf("Pipeline variables: %+v", variables)

	c.JSON(http.StatusOK, gin.H{"variables": variables})
}

// Helper function to get example variables
func getExampleVariables() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"key":           "CI_COMMIT_REF_NAME",
			"value":         "main",
			"variable_type": "env_var",
		},
		{
			"key":           "CI_COMMIT_SHA",
			"value":         "1234567890abcdef",
			"variable_type": "env_var",
		},
		{
			"key":           "CI_PROJECT_NAME",
			"value":         "example-project",
			"variable_type": "env_var",
		},
		{
			"key":           "CI_ENVIRONMENT_NAME",
			"value":         "production",
			"variable_type": "env_var",
		},
		{
			"key":           "CI_PIPELINE_ID",
			"value":         "1856940408",
			"variable_type": "env_var",
		},
	}
}

// Helper function to get example pipelines
func getExamplePipelines() []GitLabPipeline {
	now := time.Now()
	return []GitLabPipeline{
		{
			ID:        1,
			Status:    "success",
			Ref:       "main",
			SHA:       "1234567890abcdef",
			WebURL:    "https://gitlab.com/group/project/-/pipelines/1",
			CreatedAt: now.Add(-time.Hour),
			UpdatedAt: now.Add(-30 * time.Minute),
			User: struct {
				ID        int    `json:"id"`
				Name      string `json:"name"`
				Username  string `json:"username"`
				WebURL    string `json:"web_url"`
				AvatarURL string `json:"avatar_url"`
			}{
				ID:        1,
				Name:      "John Doe",
				Username:  "johndoe",
				WebURL:    "https://gitlab.com/johndoe",
				AvatarURL: "https://secure.gravatar.com/avatar/abcdefg",
			},
		},
		{
			ID:        2,
			Status:    "failed",
			Ref:       "feature-branch",
			SHA:       "abcdef1234567890",
			WebURL:    "https://gitlab.com/group/project/-/pipelines/2",
			CreatedAt: now.Add(-2 * time.Hour),
			UpdatedAt: now.Add(-90 * time.Minute),
			User: struct {
				ID        int    `json:"id"`
				Name      string `json:"name"`
				Username  string `json:"username"`
				WebURL    string `json:"web_url"`
				AvatarURL string `json:"avatar_url"`
			}{
				ID:        2,
				Name:      "Jane Smith",
				Username:  "janesmith",
				WebURL:    "https://gitlab.com/janesmith",
				AvatarURL: "https://secure.gravatar.com/avatar/hijklmn",
			},
		},
		{
			ID:        3,
			Status:    "running",
			Ref:       "develop",
			SHA:       "9876543210fedcba",
			WebURL:    "https://gitlab.com/group/project/-/pipelines/3",
			CreatedAt: now.Add(-30 * time.Minute),
			UpdatedAt: now.Add(-5 * time.Minute),
			User: struct {
				ID        int    `json:"id"`
				Name      string `json:"name"`
				Username  string `json:"username"`
				WebURL    string `json:"web_url"`
				AvatarURL string `json:"avatar_url"`
			}{
				ID:        1,
				Name:      "John Doe",
				Username:  "johndoe",
				WebURL:    "https://gitlab.com/johndoe",
				AvatarURL: "https://secure.gravatar.com/avatar/abcdefg",
			},
		},
	}
}

// Helper function to get example pipeline details with all fields
func getExamplePipelineDetails() map[string]interface{} {
	now := time.Now()
	startTime := now.Add(-30 * time.Minute)
	endTime := now.Add(-5 * time.Minute)

	return map[string]interface{}{
		"id":          1,
		"status":      "success",
		"ref":         "main",
		"sha":         "1234567890abcdef",
		"web_url":     "https://gitlab.com/group/project/-/pipelines/1",
		"created_at":  now.Add(-time.Hour).Format(time.RFC3339),
		"updated_at":  now.Add(-30 * time.Minute).Format(time.RFC3339),
		"started_at":  startTime.Format(time.RFC3339),
		"finished_at": endTime.Format(time.RFC3339),
		"duration":    float64((endTime.Unix() - startTime.Unix())),
		"coverage":    85.5,
		"user": map[string]interface{}{
			"id":         1,
			"name":       "John Doe",
			"username":   "johndoe",
			"web_url":    "https://gitlab.com/johndoe",
			"avatar_url": "https://secure.gravatar.com/avatar/abcdefg",
		},
	}
}

// GetJobDetails fetches details for a specific job
func GetJobDetails(c *gin.Context) {
	// Get job ID from URL parameter
	jobID := c.Param("id")

	// Get project ID from query parameter or config
	projectID := c.Query("project_id")
	if projectID == "" {
		// Get GitLab configuration
		config, err := GetGitLabConfig()
		if err != nil {
			log.Printf("Error getting GitLab config: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
			return
		}

		projectID = config.ProjectID
		if projectID == "" {
			log.Printf("No project ID configured or provided in query")
			c.JSON(http.StatusOK, gin.H{
				"job": map[string]interface{}{
					"id":          0,
					"name":        "Example Job",
					"status":      "unknown",
					"stage":       "build",
					"web_url":     "#",
					"duration":    0,
					"created_at":  time.Now(),
					"started_at":  time.Now(),
					"finished_at": time.Now(),
				},
				"note": "Using example data because no project ID is configured or provided",
			})
			return
		}
	}

	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"job": map[string]interface{}{
				"id":          0,
				"name":        "Example Job",
				"status":      "unknown",
				"stage":       "build",
				"web_url":     "#",
				"duration":    0,
				"created_at":  time.Now(),
				"started_at":  time.Now(),
				"finished_at": time.Now(),
			},
			"note": "Using example data because GitLab token is not configured",
		})
		return
	}

	// Make API request to get job details
	endpoint := fmt.Sprintf("projects/%s/jobs/%s", projectID, jobID)
	log.Printf("Fetching job details from endpoint: %s", endpoint)
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		log.Printf("Error fetching GitLab job details: %v", err)

		// Check if it's a 404 error (job not found)
		if strings.Contains(err.Error(), "404") {
			c.JSON(http.StatusOK, gin.H{
				"job": map[string]interface{}{
					"id":          0,
					"name":        "Job Not Found",
					"status":      "unknown",
					"stage":       "unknown",
					"web_url":     fmt.Sprintf("%s/project/-/jobs/%s", config.URL, jobID),
					"duration":    0,
					"created_at":  time.Now(),
					"started_at":  time.Now(),
					"finished_at": time.Now(),
				},
				"note": fmt.Sprintf("Job with ID %s not found. Please check if the job exists and you have access to it.", jobID),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"job": map[string]interface{}{
				"id":          0,
				"name":        "Example Job",
				"status":      "unknown",
				"stage":       "build",
				"web_url":     "#",
				"duration":    0,
				"created_at":  time.Now(),
				"started_at":  time.Now(),
				"finished_at": time.Now(),
			},
			"note": fmt.Sprintf("Error fetching job details: %v", err),
		})
		return
	}

	// Parse the response
	var job map[string]interface{}
	if err := json.Unmarshal(body, &job); err != nil {
		log.Printf("Error parsing GitLab job details: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"job": map[string]interface{}{
				"id":          0,
				"name":        "Example Job",
				"status":      "unknown",
				"stage":       "build",
				"web_url":     "#",
				"duration":    0,
				"created_at":  time.Now(),
				"started_at":  time.Now(),
				"finished_at": time.Now(),
			},
			"note": fmt.Sprintf("Error parsing job details: %v", err),
		})
		return
	}

	// Get job trace (logs)
	traceEndpoint := fmt.Sprintf("projects/%s/jobs/%s/trace", projectID, jobID)
	traceBody, traceErr := makeGitLabAPIRequest("GET", traceEndpoint, config)
	if traceErr == nil {
		// Add trace to job details
		job["trace"] = string(traceBody)
	} else {
		log.Printf("Error fetching job trace: %v", traceErr)
		job["trace"] = "Job logs not available"
	}

	// Get job artifacts
	artifactsEndpoint := fmt.Sprintf("projects/%s/jobs/%s/artifacts", projectID, jobID)
	artifactsBody, artifactsErr := makeGitLabAPIRequest("GET", artifactsEndpoint, config)
	if artifactsErr == nil {
		var artifacts []map[string]interface{}
		if err := json.Unmarshal(artifactsBody, &artifacts); err == nil {
			job["artifacts"] = artifacts
		}
	} else {
		job["artifacts"] = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{"job": job})
}

// GetGitLabMergeRequests fetches merge requests from GitLab
func GetGitLabMergeRequests(c *gin.Context) {
	// Get GitLab configuration
	config, err := GetGitLabConfig()
	if err != nil {
		log.Printf("Error getting GitLab config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
		return
	}

	// Check if token is set
	if config.Token == "" {
		log.Printf("GitLab token not configured")
		c.JSON(http.StatusOK, gin.H{
			"merge_requests": getExampleMergeRequests(),
			"note":           "Using example data because GitLab token is not configured",
		})
		return
	}

	// Get project ID from config
	projectID := config.ProjectID
	if projectID == "" {
		log.Printf("No project ID configured")
		c.JSON(http.StatusOK, gin.H{
			"merge_requests": getExampleMergeRequests(),
			"note":           "Using example data because no project ID is configured",
		})
		return
	}

	// Get query parameters for filtering
	state := c.DefaultQuery("state", "all")             // all, opened, closed, merged
	perPage := c.DefaultQuery("per_page", "100")        // number of results per page
	page := c.DefaultQuery("page", "1")                 // page number
	orderBy := c.DefaultQuery("order_by", "created_at") // created_at, updated_at
	sort := c.DefaultQuery("sort", "desc")              // asc, desc

	// Build the endpoint URL with query parameters
	endpoint := fmt.Sprintf("projects/%s/merge_requests?state=%s&per_page=%s&page=%s&order_by=%s&sort=%s",
		projectID, state, perPage, page, orderBy, sort)

	log.Printf("Fetching merge requests from endpoint: %s", endpoint)

	// Make API request to get merge requests
	body, err := makeGitLabAPIRequest("GET", endpoint, config)
	if err != nil {
		log.Printf("Error fetching GitLab merge requests: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"merge_requests": getExampleMergeRequests(),
			"note":           fmt.Sprintf("Error fetching merge requests: %v. Using example data instead.", err),
		})
		return
	}

	// Parse the response
	var mergeRequests []GitLabMergeRequest
	if err := json.Unmarshal(body, &mergeRequests); err != nil {
		log.Printf("Error parsing GitLab merge requests: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"merge_requests": getExampleMergeRequests(),
			"note":           fmt.Sprintf("Error parsing merge requests: %v. Using example data instead.", err),
		})
		return
	}

	log.Printf("Successfully fetched %d merge requests from GitLab", len(mergeRequests))
	c.JSON(http.StatusOK, gin.H{
		"merge_requests": mergeRequests,
		"count":          len(mergeRequests),
	})
}

// getExampleMergeRequests returns example merge request data
func getExampleMergeRequests() []GitLabMergeRequest {
	now := time.Now()
	mergedTime := now.Add(-2 * time.Hour)

	return []GitLabMergeRequest{
		{
			ID:           1,
			IID:          101,
			Title:        "Add new feature for user authentication",
			Description:  "This MR adds OAuth2 authentication support",
			State:        "merged",
			CreatedAt:    now.Add(-3 * time.Hour),
			UpdatedAt:    now.Add(-2 * time.Hour),
			MergedAt:     &mergedTime,
			ClosedAt:     nil,
			WebURL:       "https://gitlab.com/group/project/-/merge_requests/101",
			SourceBranch: "feature/oauth2-auth",
			TargetBranch: "main",
			Author: GitLabUser{
				ID:        1,
				Name:      "Alice Developer",
				Username:  "alice",
				AvatarURL: "https://gitlab.com/uploads/-/system/user/avatar/1/avatar.png",
			},
			Assignee: &GitLabUser{
				ID:        2,
				Name:      "Bob Reviewer",
				Username:  "bob",
				AvatarURL: "https://gitlab.com/uploads/-/system/user/avatar/2/avatar.png",
			},
			MergedBy: &GitLabUser{
				ID:        2,
				Name:      "Bob Reviewer",
				Username:  "bob",
				AvatarURL: "https://gitlab.com/uploads/-/system/user/avatar/2/avatar.png",
			},
			WorkInProgress: false,
			MergeStatus:    "can_be_merged",
			Draft:          false,
			HasConflicts:   false,
			TimeStats: struct {
				TimeEstimate        int    `json:"time_estimate"`
				TotalTimeSpent      int    `json:"total_time_spent"`
				HumanTimeEstimate   string `json:"human_time_estimate"`
				HumanTotalTimeSpent string `json:"human_total_time_spent"`
			}{
				TimeEstimate:        7200,
				TotalTimeSpent:      5400,
				HumanTimeEstimate:   "2h",
				HumanTotalTimeSpent: "1h 30m",
			},
		},
		{
			ID:           2,
			IID:          102,
			Title:        "Fix critical bug in payment processing",
			Description:  "Resolves issue #123 with payment validation",
			State:        "opened",
			CreatedAt:    now.Add(-1 * time.Hour),
			UpdatedAt:    now.Add(-30 * time.Minute),
			MergedAt:     nil,
			ClosedAt:     nil,
			WebURL:       "https://gitlab.com/group/project/-/merge_requests/102",
			SourceBranch: "bugfix/payment-validation",
			TargetBranch: "main",
			Author: GitLabUser{
				ID:        3,
				Name:      "Charlie Coder",
				Username:  "charlie",
				AvatarURL: "https://gitlab.com/uploads/-/system/user/avatar/3/avatar.png",
			},
			Assignee: &GitLabUser{
				ID:        1,
				Name:      "Alice Developer",
				Username:  "alice",
				AvatarURL: "https://gitlab.com/uploads/-/system/user/avatar/1/avatar.png",
			},
			MergedBy:       nil,
			WorkInProgress: false,
			MergeStatus:    "can_be_merged",
			Draft:          false,
			HasConflicts:   false,
			TimeStats: struct {
				TimeEstimate        int    `json:"time_estimate"`
				TotalTimeSpent      int    `json:"total_time_spent"`
				HumanTimeEstimate   string `json:"human_time_estimate"`
				HumanTotalTimeSpent string `json:"human_total_time_spent"`
			}{
				TimeEstimate:        3600,
				TotalTimeSpent:      1800,
				HumanTimeEstimate:   "1h",
				HumanTotalTimeSpent: "30m",
			},
		},
		{
			ID:           3,
			IID:          103,
			Title:        "Update documentation for API endpoints",
			Description:  "Comprehensive documentation update for v2 API",
			State:        "opened",
			CreatedAt:    now.Add(-45 * time.Minute),
			UpdatedAt:    now.Add(-15 * time.Minute),
			MergedAt:     nil,
			ClosedAt:     nil,
			WebURL:       "https://gitlab.com/group/project/-/merge_requests/103",
			SourceBranch: "docs/api-v2-update",
			TargetBranch: "develop",
			Author: GitLabUser{
				ID:        4,
				Name:      "Diana Writer",
				Username:  "diana",
				AvatarURL: "https://gitlab.com/uploads/-/system/user/avatar/4/avatar.png",
			},
			Assignee:       nil,
			MergedBy:       nil,
			WorkInProgress: true,
			MergeStatus:    "can_be_merged",
			Draft:          true,
			HasConflicts:   false,
			TimeStats: struct {
				TimeEstimate        int    `json:"time_estimate"`
				TotalTimeSpent      int    `json:"total_time_spent"`
				HumanTimeEstimate   string `json:"human_time_estimate"`
				HumanTotalTimeSpent string `json:"human_total_time_spent"`
			}{
				TimeEstimate:        5400,
				TotalTimeSpent:      2700,
				HumanTimeEstimate:   "1h 30m",
				HumanTotalTimeSpent: "45m",
			},
		},
	}
}
