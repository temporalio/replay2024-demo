Multiplayer Snake Game, Powered By Temporal
===

This repository contains code from the interactive [Snake game](https://en.wikipedia.org/wiki/Snake_(video_game_genre)) during our [Replay 2024 conference](https://replay.temporal.io/).

Here's a demo of it in action:

https://github.com/user-attachments/assets/4163b799-f857-49e4-8db0-41bba04f4ddc

Prerequisites
===
* [Docker](https://www.docker.com/get-started/), including [Docker Compose](https://docs.docker.com/compose/)
* [node.js](https://nodejs.org/en/download/package-manager) version 18 or later

Installation
===

Start the Temporal Server
---
1. Run the following, and leave it running in the background:
    ```
    docker compose up
    ```

1. Once complete, it should look like the following:

    <img width="493" alt="Screenshot 2024-09-11 at 9 59 31 PM" src="https://github.com/user-attachments/assets/6b6e2a63-3b03-4d73-b540-231c64c1102d">


Set up the UI
---
1. Change into the UI directory:
    ```
    cd snakes
    ```

1. Install dependencies:
    ```
    npm install
    ```

1. Create a .env file containing the following (in the `snakes` directory):
    ```
    # (contents of .env file)
    TEMPORAL_TASK_QUEUE=game
    TEMPORAL_WORKFLOW_TYPE=GameWorkflow
    TEMPORAL_ADDRESS=127.0.0.1:7243
    TEMPORAL_NAMESPACE=default
    ```

1. Load the file:
    ```
    source .env
    ```

1. Run the UI, and leave this running in the background as well.
    ```
    # --host param used so you can connect workers from other machines
    npm run dev -- --host 0.0.0.0 --open 
    ```

1. A browser window will automatically open to http://localhost:5173/ and looks like the following:

    <img width="344" alt="Screenshot 2024-09-11 at 10 00 49 PM" src="https://github.com/user-attachments/assets/0d553958-2a99-413d-b188-f94890e32bca">


Playing the game
===
TODO

Troubleshooting
===
**Error: The container name "/temporal-postgresql" is already in use**
This can happen if you have installed another Docker container with, for example, one of our [Getting Started](https://learn.temporal.io/getting_started/) examples that uses the same default name.

To give this demo's container a different name, modify the `docker-compose.yaml` file and change the following line:

```
services:
  postgresql:
    container_name: temporal-postgresql-demo # Change name here
```

Credit
===
Authors:
- @robholland
- @Alex-Tideman
- @steveandroulakis
