package grpcclient

import (
	"context"
	"log"
	"os"

	grpc_cronjob_controller "github.com/QuestraDigital/goServices/ArgoCD-Web-App/grpc_client/protos"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"
)

func TriggerCronjobService(status bool) (string, error) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Printf("Error loading .env file")
	}
	address := os.Getenv("CRONJOB_URL")
	// Set up a connection to the server
	conn, err := grpc.Dial(address, grpc.WithInsecure())
	if err != nil {
		log.Printf("did not connect: %v", err)
		return "", err
	}
	defer conn.Close()

	// Create a new client
	client := grpc_cronjob_controller.NewCronjobControllerClient(conn)

	// Trigger Cronjob
	response, err := client.ControlCronjob(context.Background(), &grpc_cronjob_controller.ControlCronjobRequest{
		StartCronjob: status,
	})
	if err != nil {
		log.Printf("Error sending request to Cronjob: %v", err)
		return "", err
	}
	if !response.Success {
		log.Printf("Cronjob status: %s", response.Message)
		return response.Message, nil
	}
	log.Printf("Cronjob status: %s", response.Message)
	return response.Message, nil
}

func GetCronjobStatus(status bool) (bool, error) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Printf("Error loading .env file")
	}
	address := os.Getenv("CRONJOB_URL")
	// Set up a connection to the server
	conn, err := grpc.Dial(address, grpc.WithInsecure())
	if err != nil {
		log.Printf("did not connect: %v", err)
		return false, err
	}
	defer conn.Close()

	// Create a new client
	client := grpc_cronjob_controller.NewCronjobControllerClient(conn)

	// Get Cronjob status
	response, err := client.GetCronjobStatus(context.Background(), &grpc_cronjob_controller.CronjobStatus{
		Running: status,
	})
	if err != nil {
		log.Printf("Error sending request to Cronjob: %v", err)
		return false, err
	}
	log.Printf("Cronjob status: %v", response.Running)
	return response.Running, nil
}
