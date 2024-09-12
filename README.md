Multiplayer Snake Game, Powered By Temporal
===

This repository contains code from the interactive [Snake game](https://en.wikipedia.org/wiki/Snake_(video_game_genre)) during our [Replay 2024 conference](https://replay.temporal.io/).

Here's a demo of it in action:

https://github.com/user-attachments/assets/4163b799-f857-49e4-8db0-41bba04f4ddc

Playing the game
===
Before beginning, grab two of your friends!

1. Go to http://**[your ui host]**:5173 (e.g. http://localhost:5173/)
1. From the main menu, choose **Start New Game**.

    <img width="344" alt="Screenshot 2024-09-11 at 10 00 49 PM" src="https://github.com/user-attachments/assets/0d553958-2a99-413d-b188-f94890e32bca">

1. The Lobby will appear, and each player should scan the QR code of their snake colour of choice.

    <img width="1205" alt="Screenshot 2024-09-11 at 10 09 55 PM" src="https://github.com/user-attachments/assets/d2ab0703-38fa-49e9-a901-a7763df4c694">

1. Once all players are ready, click the **Start Round** button to begin!

Installing the game
===

Download Prerequisites
---
If you don't already have them, you will need:
* [Docker](https://www.docker.com/get-started/), including [Docker Compose](https://docs.docker.com/compose/)
* [node.js](https://nodejs.org/en/download/package-manager) version 18 or later


Start the Temporal Server
---
1. Run the following, and leave it running in the background:
    ```
    docker compose up
    ```

Set up the UI (/snakes)
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

1. A browser window will automatically open to http://localhost:5173/ showing the game main screen.

Set up the Temporal Workers (/game)
---

1. Change into the `game` directory:

    ```
    cd game
    ```

1. Install dependencies:

    ```
    npm install
    ```

1. Create an `.env` file in the game directory. Ensure environment variables are unset so we connect to the local Docker-based server:

    ```
    # (contents of .env file)
    TEMPORAL_ADDRESS="192.168.0.8:7233"
    TEMPORAL_NAMESPACE="default"
    TEMPORAL_CLIENT_CERT_PATH="" # set this empty
    TEMPORAL_CLIENT_KEY_PATH="" # set this empty

    # set this to the host ip you're running the UI server on. See UI output above (if localhost then use 127.0.0.1:5173)
    export SOCKETIO_HOST=http://127.0.0.1:5173
    ```

1. Load the file:
    ```
    source .env
    ```

1. Run the game worker (and leave this running in the background):
    ```
    npm run game-worker
    ```

1. If successful, the output should look like this:

    <img width="836" alt="Screenshot 2024-09-11 at 10 18 15 PM" src="https://github.com/user-attachments/assets/9cc6d33e-c523-47cc-9b09-8cc7bff0ea33">

1. In a new CLI tab, run:

    ```
    # set this to the host ip/dns name you're running the UI server on. See UI output above (if localhost then use 127.0.0.1:5173)
    export SOCKETIO_HOST=http://127.0.0.1:5173
    
    npm run snake-worker-host-worker
    ```

1. If all is well, you should see output like the following:

    <img width="889" alt="Screenshot 2024-09-11 at 10 23 27 PM" src="https://github.com/user-attachments/assets/3cdd84cf-103f-48e8-8738-210aa0595d5f">

Test that demo is working
---
Go to http://<your ui host>:5173/ and from the main screen, choose “Start Demo Game” — you should see the following with the snakes moving around by themselves.


Troubleshooting
===

`docker compose up` just hangs
---
Check two things:
1. Is the network you're on restricting Docker? (Try tethering from your phone.)
2. Is your Docker container already installed and therefore there's nothing left to do?

Error: The container name "/temporal-postgresql" is already in use
---
This can happen if you have installed another Docker container with, for example, one of our [Getting Started](https://learn.temporal.io/getting_started/) examples that uses the same default name.

To give this demo's container a different name, modify the `docker-compose.yaml` file and change the following line:

```
services:
  postgresql:
    container_name: temporal-postgresql-demo # Change name here
```

The QR code from the lobby just goes to localhost, which isn't valid on my phone
---
TODO.

SOCKETIO_HOST environment variable is not defined when running npm run snake-worker-host-worker
---
Don't forget that before you run this command, you have to type the following (even though it's already in the `.env` file in the directory):

```
export SOCKETIO_HOST=http://127.0.0.1:5173
```

When attempting to run the demo, the game screen just says "Loading game..."
---
TODO.

Credit
===
Authors:
- @robholland
- @Alex-Tideman
- @steveandroulakis
