#!/bin/bash

# Check if worker number is passed as argument
if [ -z "$1" ]; then
  echo "Usage: ./stop-workers.sh <worker-number>"
  exit 1
fi

# Set the worker number
WORKER_NUMBER=$1

# Define the worker name
WORKER_NAME="snake-worker-$WORKER_NUMBER"

# Stop and delete the workers from pm2
pm2 delete "${WORKER_NAME}-1" > /dev/null 2>&1
pm2 delete "${WORKER_NAME}-2" > /dev/null 2>&1

# Check if the processes were deleted successfully
if pm2 describe "${WORKER_NAME}-1" > /dev/null || pm2 describe "${WORKER_NAME}-2" > /dev/null; then
  echo "Failed to delete one or more workers."
else
  echo "Workers ${WORKER_NAME}-1 and ${WORKER_NAME}-2 have been successfully deleted."
fi

# Display the PM2 process list
pm2 list
