# Start from the latest golang base image
FROM golang:1.22.1

# Set the Current Working Directory inside the Docker container
WORKDIR /app

RUN go install github.com/air-verse/air@v1.52.3

# Copy go mod and sum files
COPY go.mod ./

# Download all dependencies
RUN go mod download
RUN go mod tidy

# Copy the source from the current directory to the Working Directory inside the Docker container
COPY . .

# Expose port 8001 to the outside world
EXPOSE 8001

# Use air for hot reloading during development
CMD ["air", "-c", ".air.toml"]

# Uncomment to run without air
# CMD ["go", "run", "server.go"] 