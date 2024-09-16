package snakes

import (
	"context"
	"log"
	"time"

	"go.temporal.io/api/serviceerror"
	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/worker"
	"go.temporal.io/sdk/workflow"
)

type SnakeWorkflowInput struct {
	RoundId     string `json:"roundId"`
	Id          string `json:"id"`
	Direction   string `json:"direction"`
	NomsPerMove int    `json:"nomsPerMove"`
	NomDuration int    `json:"nomDuration"`
}

const (
	SnakeChangeDirectionSignalName = "snakeChangeDirection"
	SnakeMoveSignalName            = "snakeMove"
	WorkerStartedSignalName        = "workerStarted"
	SnakeMovesBeforeCAN            = 20
)

type SnakeMoveSignal struct {
	Id        string `json:"id"`
	Direction string `json:"direction"`
}

func SnakeWorkflow(ctx workflow.Context, input *SnakeWorkflowInput) error {
	direction := input.Direction

	activityOptions := workflow.ActivityOptions{
		StartToCloseTimeout: time.Duration(input.NomDuration*2) * time.Millisecond,
		TaskQueue:           "game",
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    1,
			BackoffCoefficient: 1,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, activityOptions)

	ch := workflow.GetSignalChannel(ctx, SnakeChangeDirectionSignalName)
	workflow.Go(ctx, func(gCtx workflow.Context) {
		for {
			var newDirection string
			if ch.Receive(gCtx, &newDirection) {
				direction = newDirection
			}
		}
	})

	moves := 0

	for {
		noms := make([]workflow.Future, input.NomsPerMove)
		for i := range noms {
			noms[i] = workflow.ExecuteActivity(ctx, "snakeNom", input.Id, input.NomDuration)
		}
		for _, nom := range noms {
			if err := nom.Get(ctx, nil); err != nil {
				return err
			}
		}

		s := SnakeMoveSignal{Id: input.Id, Direction: direction}
		err := workflow.SignalExternalWorkflow(ctx, input.RoundId, "", SnakeMoveSignalName, &s).Get(ctx, nil)
		if err != nil {
			log.Println("Cannot signal round, exiting")
			break
		}

		moves++
		if moves > SnakeMovesBeforeCAN {
			return workflow.NewContinueAsNewError(ctx, SnakeWorkflow, input)
		}
	}

	return nil
}

const ()

type WorkerStartedSignal struct {
	Identity string `json:"identity"`
}

type Activities struct {
	Client client.Client
}

// SnakeWorker activity implementation
func (a *Activities) SnakeWorker(ctx context.Context, roundId string, identity string) error {
	heartbeatCtx, cancelHeartbeat := context.WithCancel(ctx)
	defer cancelHeartbeat()

	// Start a heartbeat goroutine to keep the worker alive
	go func() {
		ticker := time.NewTicker(200 * time.Millisecond)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				activity.RecordHeartbeat(heartbeatCtx)
			case <-heartbeatCtx.Done():
				return
			}
		}
	}()

	// Create a new worker for the "snakes" task queue
	w := worker.New(a.Client, "snakes", worker.Options{
		Identity:                     identity,
		StickyScheduleToStartTimeout: time.Second,
		WorkerStopTimeout:            200 * time.Millisecond,
	})

	// Register the SnakeWorkflow with the worker
	w.RegisterWorkflowWithOptions(SnakeWorkflow, workflow.RegisterOptions{Name: "snakeWorkflow"})

	// Send a signal to the workflow
	err := a.Client.SignalWorkflow(ctx, roundId, "", WorkerStartedSignalName, &WorkerStartedSignal{Identity: identity})
	if err != nil {
		if _, ok := err.(*serviceerror.NotFound); ok {
			return nil // Gracefully handle workflow not found
		}
		return err
	}

	// Run the worker
	cancelCh := make(chan interface{})
	go func() {
		<-ctx.Done()
		close(cancelCh)
	}()

	err = w.Run(cancelCh)
	if err != nil {
		return err
	}

	return temporal.NewCanceledError()
}
