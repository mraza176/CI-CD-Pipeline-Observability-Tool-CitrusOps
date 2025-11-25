package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"

	notifications "github.com/QuestraDigital/goServices/Notifications/protos"
	"github.com/joho/godotenv"
	"github.com/nats-io/nats.go"
	"google.golang.org/grpc"
)

const (
	port             = ":50055"
	natsSubjectSlack = "slack"
	natsSubjectEmail = "email"
)

var nc *nats.Conn // Global NATS connection variable

type server struct {
	notifications.UnimplementedNotificationsServer
}

// Initialize NATS connection
func initNATS() error {
	var err error
	nc, err = nats.Connect(os.Getenv("NATS_URL"))
	if err != nil {
		return fmt.Errorf("failed to connect to NATS server: %v", err)
	}
	log.Println("Connected to NATS server:", os.Getenv("NATS_URL"))
	return nil
}

// publish message in NATS server
func publishMessage(subject, message string) {
	if nc == nil {
		log.Println("NATS connection is not initialized")
		return
	}

	err := nc.Publish(subject, []byte(message))
	if err != nil {
		log.Printf("Error publishing message on subject %s: %v", subject, err)
	} else {
		log.Printf("Message published (%s) successfully", subject)
	}
}

func (s *server) SendNotification(ctx context.Context, req *notifications.NotificationRequest) (*notifications.NotificationResponse, error) {
	message := req.GetMessage()

	fmt.Printf("Received notification request: Message=%s\n", message)
	publishMessage(natsSubjectSlack, message)
	publishMessage(natsSubjectEmail, message)

	return &notifications.NotificationResponse{Status: "Notification sent successfully"}, nil
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Printf("Error loading .env file")
	}
	if err := initNATS(); err != nil {
		log.Fatalf("Failed to initialize NATS: %v", err)
	}
	defer nc.Close() // Close the NATS connection when the program exits

	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}
	s := grpc.NewServer()
	notifications.RegisterNotificationsServer(s, &server{})
	log.Printf("Server listening on port %s", port)

	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
