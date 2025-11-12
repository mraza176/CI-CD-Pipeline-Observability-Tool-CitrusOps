package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	controller "github.com/QuestraDigital/goServices/GitLab-Web-App/controller"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Create a new Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Define routes
	router.GET("/gitlab/pipelines", controller.GetGitLabPipelines)
	router.GET("/gitlab/pipeline/:id", controller.GetGitLabPipeline)
	router.GET("/gitlab/projects", controller.GetGitLabProjects)
	router.GET("/gitlab/pipeline/:id/details", controller.GetPipelineDetails)
	router.GET("/gitlab/pipeline/:id/jobs", controller.GetPipelineJobs)
	router.GET("/gitlab/pipeline/:id/test-report", controller.GetPipelineTestReport)
	router.GET("/gitlab/pipeline/:id/test-report-summary", controller.GetPipelineTestReportSummary)
	router.POST("/gitlab/pipeline/:id/retry", controller.RetryPipeline)
	router.POST("/gitlab/pipeline/:id/cancel", controller.CancelPipeline)
	router.GET("/gitlab/pipeline/:id/variables", controller.GetPipelineVariables)
	router.GET("/gitlab/job/:id", controller.GetJobDetails)
	router.GET("/gitlab/merge-requests", controller.GetGitLabMergeRequests)

	// Configuration endpoints
	router.GET("/gitlab/config", func(c *gin.Context) {
		config, err := controller.GetGitLabConfig()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error getting GitLab config: %v", err)})
			return
		}

		// Don't send the token back for security reasons
		c.JSON(http.StatusOK, gin.H{
			"url":        config.URL,
			"token_set":  config.Token != "",
			"project_id": config.ProjectID,
		})
	})

	router.POST("/gitlab/token", func(c *gin.Context) {
		var request struct {
			Token string `json:"token"`
		}
		if err := c.BindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}
		controller.StoreToken(c, request.Token)
	})

	router.POST("/gitlab/url", func(c *gin.Context) {
		var request struct {
			URL string `json:"url"`
		}
		if err := c.BindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}
		controller.StoreURL(c, request.URL)
	})

	router.POST("/gitlab/project-id", func(c *gin.Context) {
		var request struct {
			ProjectID string `json:"project_id"`
		}
		if err := c.BindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}
		controller.StoreProjectID(c, request.ProjectID)
	})

	// Setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-quit
		log.Println("Shutting down server...")
		// Any cleanup code here
	}()

	// Start the server
	port := "8001"
	log.Printf("Starting server on port %s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
