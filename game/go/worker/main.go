package main

import (
	"crypto/tls"
	"fmt"
	"log/slog"
	"os"
	"strings"

	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/log"
	"go.temporal.io/sdk/worker"

	// Import the Temporal API package
	snakes "github.com/temporalio/replay2024-demo"
)

// CreateClientOptionsFromEnv creates a client.Options instance, configures
// it based on environment variables, and returns that instance.
// It supports the following environment variables:
//
//	TEMPORAL_ADDRESS: Host and port (formatted as host:port) of the Temporal Frontend Service
//	TEMPORAL_NAMESPACE: Namespace to be used by the Client
//	TEMPORAL_CLIENT_CERT_PATH: Path to the x509 certificate
//	TEMPORAL_CLIENT_KEY_PATH: Path to the private certificate key
//	TEMPORAL_CA_CERT_PATH: Path to the CA certificate
func CreateClientOptionsFromEnv() (client.Options, error) {
	hostPort := os.Getenv("TEMPORAL_ADDRESS")
	namespaceName := os.Getenv("TEMPORAL_NAMESPACE")

	// Must explicitly set the Namespace for non-cloud use.
	if strings.Contains(hostPort, ".tmprl.cloud:") && namespaceName == "" {
		return client.Options{}, fmt.Errorf("namespace name unspecified; required for Temporal Cloud")
	}

	if namespaceName == "" {
		namespaceName = "default"
		fmt.Printf("Namespace name unspecified; using value '%s'\n", namespaceName)
	}

	clientOpts := client.Options{
		HostPort:  hostPort,
		Namespace: namespaceName,
		Logger:    log.NewStructuredLogger(slog.Default()),
	}

	// Load TLS config if the client certificate is provided
	if certPath := os.Getenv("TEMPORAL_CLIENT_CERT_PATH"); certPath != "" {
		cert, err := tls.LoadX509KeyPair(certPath, os.Getenv("TEMPORAL_CLIENT_KEY_PATH"))
		if err != nil {
			return clientOpts, fmt.Errorf("failed loading client key pair: %w", err)
		}

		clientOpts.ConnectionOptions.TLS = &tls.Config{
			Certificates: []tls.Certificate{cert},
		}
	}

	return clientOpts, nil
}

func main() {
	clientOptions, err := CreateClientOptionsFromEnv()
	if err != nil {
		slog.Error("Unable to create Temporal client options:", "error", err)
		return // Exit the function if there's an error
	}

	// Create Temporal client using mTLS-enabled client options
	c, err := client.Dial(clientOptions)
	if err != nil {
		slog.Error("Unable to create Temporal client:", "error", err)
		return // Exit the function if there's an error
	}

	defer c.Close()

	w := worker.New(c, os.Getenv("TEMPORAL_TASK_QUEUE"), worker.Options{
		MaxConcurrentActivityExecutionSize: 1,
	})

	// Register the activity and workflow
	a := snakes.Activities{Client: c}
	w.RegisterActivityWithOptions(a.SnakeWorker, activity.RegisterOptions{Name: "snakeWorker"})
	w.RegisterWorkflow(snakes.SnakeWorkflow)

	// Run the worker
	err = w.Run(worker.InterruptCh())
	if err != nil {
		slog.Error("Unable to start worker:", "error", err)
	}
}
