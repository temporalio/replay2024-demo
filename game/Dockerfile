# Stage 1: Build
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --include=dev

# Copy the rest of the application code
COPY . .

# Ensure TypeScript and ts-node are installed globally
RUN npm install -g typescript ts-node

# Stage 2: Production
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only necessary files from the build stage (including node_modules)
COPY --from=build /usr/src/app /usr/src/app

# Ensure that the certificates are copied
COPY ./replay-2024-demo.sdvdw.crt ./replay-2024-demo.sdvdw.crt
COPY ./replay-2024-demo.sdvdw.key ./replay-2024-demo.sdvdw.key

# Environment variables to be provided during runtime
ENV TEMPORAL_ADDRESS=""
ENV TEMPORAL_NAMESPACE=""
ENV TEMPORAL_CLIENT_CERT_PATH="./replay-2024-demo.sdvdw.crt"
ENV TEMPORAL_CLIENT_KEY_PATH="./replay-2024-demo.sdvdw.key"
ENV SOCKETIO_HOST=""

# Run the Temporal worker, and tail the log
CMD ["/bin/sh", "-c", "npm run game-worker && tail -f /dev/null"]

# docker run -e TEMPORAL_ADDRESS="replay-2024-demo.sdvdw.tmprl.cloud:7233" \
#            -e TEMPORAL_NAMESPACE="replay-2024-demo.sdvdw" \
#            -e SOCKETIO_HOST="http://127.0.0.1:5173" \
#            temporal-replay-demo-2024-game-worker

# docker run -e TEMPORAL_ADDRESS="192.168.0.8:7233" \
#            -e TEMPORAL_NAMESPACE="default" \
#            -e TEMPORAL_CLIENT_CERT_PATH="" \
#            -e TEMPORAL_CLIENT_KEY_PATH="" \
#            -e SOCKETIO_HOST="http://192.168.215.2:5173" \
#            temporal-replay-demo-2024-game-worker

# docker run -e TEMPORAL_ADDRESS="replay-2024-demo.sdvdw.tmprl.cloud:7233" \
#            -e TEMPORAL_NAMESPACE="replay-2024-demo.sdvdw" \
#            -e TEMPORAL_CLIENT_CERT_PATH="replay-2024-demo.sdvdw.crt" \
#            -e TEMPORAL_CLIENT_KEY_PATH="replay-2024-demo.sdvdw.key" \
#            -e SOCKETIO_HOST="http://replay-gameu-hxtdpzmhebqu-b317b10490591f8c.elb.us-west-2.amazonaws.com:5173" \
#            temporal-replay-demo-2024-game-worker