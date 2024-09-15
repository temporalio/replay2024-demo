#!/bin/bash

# Check if ~/.env_cloud exists
if [ ! -f ~/.env_cloud ]; then
  # If not, print an error message and exit the script
  echo "ERROR: Please create a ~/.env_cloud file with the following information (example)"
  echo ""
  echo "export SOCKETIO_HOST=http://snakes.temporal.io"
  echo "export TEMPORAL_ADDRESS=replay-2024-demo.sdvdw.tmprl.cloud:7233"
  echo "export TEMPORAL_NAMESPACE=replay-2024-demo.sdvdw"
  echo "export TEMPORAL_CLIENT_CERT_PATH=\$HOME/replay-2024-demo.sdvdw.crt"
  echo "export TEMPORAL_CLIENT_KEY_PATH=\$HOME/replay-2024-demo.sdvdw.key"
  echo "export TEMPORAL_TASK_QUEUE=snake-workers-1"
  echo ""
  exit 1
fi

# Source the environment variables from ~/.env_cloud
source ~/.env_cloud

# Extract the task queue number from the $TEMPORAL_TASK_QUEUE environment variable
TASK_QUEUE_NUMBER=$(echo $TEMPORAL_TASK_QUEUE | grep -o '[0-9]*$')

# Informational output
echo "Running 1 worker that will spawn 2 snake workers..."
echo "Visit snakes.temporal.io/host/$TASK_QUEUE_NUMBER to view the worker UI"
echo ""
echo "Run this with forever to keep it running in the background: forever start -a -c bash ~/runworker.sh"
echo "To list running snakeworker processes, use: forever list"
echo "To monitor logs in real-time, use: forever logs -f 0 (or the index of the process from forever list)"
echo "To stop running snakeworker processes, use: forever stopall"
echo "To delete the forever managed snakeworker process, use: forever stop ~/runworker.sh && forever delete ~/runworker.sh"
echo ""

# Run the compiled Go worker binary (assuming it's in your home directory)
~/snakeworker
