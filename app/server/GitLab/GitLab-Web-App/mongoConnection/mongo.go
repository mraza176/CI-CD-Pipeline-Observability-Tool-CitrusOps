package mongoconnection

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ConnectToMongoDB establishes a connection to MongoDB and returns the client.
func ConnectToMongoDB() (*mongo.Client, error) {
	// Default MongoDB URL for local development
	url := "mongodb://mongouser:mongopassword@localhost:27017/admin"

	// Try to load from .env file if available
	if err := godotenv.Load(".env"); err == nil {
		if envURL := os.Getenv("MONGO_URL"); envURL != "" {
			url = envURL
		}
	}

	clientOptions := options.Client().ApplyURI(url)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return nil, err
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		return nil, err
	}

	log.Println("Connected to MongoDB for GitLab integration...")
	return client, nil
}
