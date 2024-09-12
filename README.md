Multiplayer Snake Game, Powered By Temporal
===

This repository contains code from the interactive [Snake game](https://en.wikipedia.org/wiki/Snake_(video_game_genre)) during our [Replay 2024 conference](https://replay.temporal.io/).

Here's a demo of it in action:

https://github.com/user-attachments/assets/4163b799-f857-49e4-8db0-41bba04f4ddc

Prerequisites
===
* [Docker](https://www.docker.com/get-started/), including [Docker Compose](https://docs.docker.com/compose/)
* [node.js](https://nodejs.org/en/download/package-manager) version 18 or later

Installing the game
===
1. Start the Temporal server, and leave it running in the background:

```
docker compose up
```

2. 

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
