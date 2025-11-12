package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GitLabConfig represents the GitLab configuration
type GitLabConfig struct {
	URL       string `json:"url" bson:"url"`
	Token     string `json:"token" bson:"token"`
	ProjectID string `json:"project_id" bson:"project_id"`
}

// Config file path - store in the current directory
var configFilePath = ".gitlab-config.json"

// GetMongoClient returns a MongoDB client
func GetMongoClient() (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Try to connect to MongoDB without authentication first
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Printf("Error connecting to MongoDB: %v", err)
		return nil, err
	}

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("Error pinging MongoDB: %v", err)
		return nil, err
	}

	log.Println("Connected to MongoDB for GitLab integration...")
	return client, nil
}

// GetGitLabConfig retrieves the GitLab configuration from file
func GetGitLabConfig() (GitLabConfig, error) {
	// Always use file-based configuration for simplicity
	return getConfigFromFile()
}

// getConfigFromFile reads GitLab configuration from a local file
func getConfigFromFile() (GitLabConfig, error) {
	// Default configuration
	config := GitLabConfig{
		URL:       "https://gitlab.com",
		Token:     "",
		ProjectID: "",
	}

	// Create config directory if it doesn't exist
	configDir := filepath.Dir(configFilePath)
	if configDir != "." && configDir != "/" {
		if err := os.MkdirAll(configDir, 0755); err != nil {
			log.Printf("Error creating config directory: %v", err)
		}
	}

	// Try to read from .env file first (for backward compatibility)
	content, err := ioutil.ReadFile(".env")
	if err == nil {
		lines := strings.Split(string(content), "\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "GITLAB_URL=") {
				config.URL = strings.TrimPrefix(line, "GITLAB_URL=")
			} else if strings.HasPrefix(line, "GITLAB_TOKEN=") {
				config.Token = strings.TrimPrefix(line, "GITLAB_TOKEN=")
			} else if strings.HasPrefix(line, "GITLAB_PROJECT_ID=") {
				config.ProjectID = strings.TrimPrefix(line, "GITLAB_PROJECT_ID=")
			}
		}
	}

	// Try to read from JSON config file (preferred method)
	jsonContent, err := ioutil.ReadFile(configFilePath)
	if err == nil {
		var jsonConfig GitLabConfig
		if err := json.Unmarshal(jsonContent, &jsonConfig); err == nil {
			// Only override values that are set in the JSON file
			if jsonConfig.URL != "" {
				config.URL = jsonConfig.URL
			}
			if jsonConfig.Token != "" {
				config.Token = jsonConfig.Token
			}
			if jsonConfig.ProjectID != "" {
				config.ProjectID = jsonConfig.ProjectID
			}
		}
	}

	return config, nil
}

// StoreToken handles storing the GitLab token
func StoreToken(c *gin.Context, token string) {
	if err := updateConfig("token", token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Token stored successfully"})
}

// StoreURL handles storing the GitLab URL
func StoreURL(c *gin.Context, url string) {
	if err := updateConfig("url", url); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "URL stored successfully"})
}

// StoreProjectID stores the GitLab project ID
func StoreProjectID(c *gin.Context, projectID string) {
	if err := updateConfig("project_id", projectID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store project ID"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project ID stored successfully"})
}

// updateConfig updates a specific field in the GitLab configuration
func updateConfig(field, value string) error {
	// Get current config
	config, err := getConfigFromFile()
	if err != nil {
		return err
	}

	// Update the specified field
	switch field {
	case "url":
		config.URL = value
	case "token":
		config.Token = value
	case "project_id":
		config.ProjectID = value
	}

	// Save to both .env and JSON file for compatibility
	if err := updateDotenv(field, value); err != nil {
		log.Printf("Warning: Failed to update .env file: %v", err)
	}

	// Save to JSON file (preferred method)
	jsonData, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(configFilePath, jsonData, 0644)
}

// updateDotenv updates or adds a key-value pair in the .env file
func updateDotenv(field, value string) error {
	// Map field to env var name
	var key string
	switch field {
	case "url":
		key = "GITLAB_URL"
	case "token":
		key = "GITLAB_TOKEN"
	case "project_id":
		key = "GITLAB_PROJECT_ID"
	default:
		return fmt.Errorf("unknown field: %s", field)
	}

	// Create .env file if it doesn't exist
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		_, err := os.Create(".env")
		if err != nil {
			return err
		}
	}

	// Read the content of the dotenv file
	content, err := ioutil.ReadFile(".env")
	if err != nil {
		return err
	}

	// Split the content into lines
	lines := strings.Split(string(content), "\n")

	// Find and update the key-value pair
	found := false
	for i, line := range lines {
		pair := strings.SplitN(line, "=", 2)
		if len(pair) == 2 && pair[0] == key {
			lines[i] = fmt.Sprintf("%s=%s", key, value)
			found = true
			break
		}
	}

	// If key is not found, add a new key-value pair
	if !found {
		newLine := fmt.Sprintf("%s=%s", key, value)
		lines = append(lines, newLine)
	}

	// Join the lines back into a string
	newContent := strings.Join(lines, "\n")

	// Write the updated content back to the dotenv file
	err = ioutil.WriteFile(".env", []byte(newContent), 0644)
	if err != nil {
		return err
	}

	return nil
}
