#!/bin/bash

# Check if worker number is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: ./startworkers.sh <worker-number> [--autorestart]"
  exit 1
fi

# Set the worker number
WORKER_NUMBER=$1
AUTO_RESTART=false

# Check if the --autorestart option is provided
if [ "$2" == "--autorestart" ]; then
  AUTO_RESTART=true
fi

# Navigate to the project directory
cd /root/replay2024-demo/game || exit

# Source environment variables
source .env_cloud

# Define the worker name
WORKER_NAME="snake-worker-$WORKER_NUMBER"

if [ "$AUTO_RESTART" = true ]; then
  echo "Starting workers in auto-restart mode with cron schedules..."

  # Start the first worker that restarts at 5, 15, 25, 35, 45, 55 minutes
  pm2 start --name "${WORKER_NAME}-1" --cron-restart="5,15,25,35,45,55 * * * *" npm -- run "snake-worker-host-worker-$WORKER_NUMBER"

  # Start the second worker that restarts at 0, 10, 20, 30, 40, 50 minutes
  pm2 start --name "${WORKER_NAME}-2" --cron-restart="0,10,20,30,40,50 * * * *" npm -- run "snake-worker-host-worker-$WORKER_NUMBER"
else
  echo "Starting workers in regular mode without auto-restart..."

  # Start the first worker in regular mode (no cron restarts)
  pm2 start --name "${WORKER_NAME}-1" npm -- run "snake-worker-host-worker-$WORKER_NUMBER"

  # Start the second worker in regular mode (no cron restarts)
  pm2 start --name "${WORKER_NAME}-2" npm -- run "snake-worker-host-worker-$WORKER_NUMBER"
fi

# Display the PM2 process list
pm2 list
