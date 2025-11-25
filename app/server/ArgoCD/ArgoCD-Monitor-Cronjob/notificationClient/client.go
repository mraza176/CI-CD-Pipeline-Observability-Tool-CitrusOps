package notificationClient

import (
	"context"
	"log"
	"os"

	notifications "github.com/QuestraDigital/goServices/ArgoCD-Monitor-Cronjob/notificationClient/protos"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"
)

func TriggerNotificationService(customMessage string) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Printf("Error loading .env file")
	}
	address := os.Getenv("NOTIFICATION_SERVICE_URL")
	// Set up a connection to the server
	conn, err := grpc.Dial(address, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()

	// Create a Notifications client
	client := notifications.NewNotificationsClient(conn)

	// Replace the following lines with your notification data
	// message := "ArgoCD pipeline is out of sync!"
	message := customMessage

	// Send the notification
	response, err := client.SendNotification(context.Background(), &notifications.NotificationRequest{
		Message: message,
	})
	if err != nil {
		log.Fatalf("Error sending notification: %v", err)
	}

	log.Printf("Notification status: %s", response.Status)
}
