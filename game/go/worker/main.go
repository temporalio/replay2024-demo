package main

import (
	"log"
	"os"

	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"

	snakes "github.com/temporalio/replay2024-demo"
)

func main() {
	c, err := client.Dial(client.Options{})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	w := worker.New(c, os.Getenv("TEMPORAL_TASK_QUEUE"), worker.Options{
		MaxConcurrentActivityExecutionSize: 1,
	})

	a := snakes.Activtities{Client: c}

	w.RegisterActivityWithOptions(a.SnakeWorker, activity.RegisterOptions{Name: "snakeWorker"})

	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}
