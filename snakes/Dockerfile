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

# Stage 2: Production
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only necessary files from the build stage (including node_modules)
COPY --from=build /usr/src/app /usr/src/app

# Ensure that the certificates are copied
COPY ./replay-2024-demo.sdvdw.crt ./replay-2024-demo.sdvdw.crt
COPY ./replay-2024-demo.sdvdw.key ./replay-2024-demo.sdvdw.key

# Expose the port for the Svelte UI (5173)
EXPOSE 5173

# Environment variables to be provided during runtime
ENV TEMPORAL_GRPC_ADDRESS=""
ENV TEMPORAL_ADDRESS=""
ENV TEMPORAL_NAMESPACE=""
ENV TEMPORAL_CLIENT_CERT_PATH="./replay-2024-demo.sdvdw.crt"
ENV TEMPORAL_CLIENT_KEY_PATH="./replay-2024-demo.sdvdw.key"
ENV TEMPORAL_TASK_QUEUE="game"
ENV TEMPORAL_WORKFLOW_TYPE="GameWorkflow"

# Run the Svelte UI and make it accessible
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--open"]

# docker run -e TEMPORAL_ADDRESS="192.168.0.8:7233" \
#            -e TEMPORAL_NAMESPACE="default" \
#            -e TEMPORAL_CLIENT_CERT_PATH="" \
#            -e TEMPORAL_CLIENT_KEY_PATH="" \
#            -e TEMPORAL_TASK_QUEUE="game" \
#            -e TEMPORAL_WORKFLOW_TYPE="GameWorkflow" \
#            -p 5173:5173 \
#            temporal-replay-demo-2024-game-ui

# docker run -e TEMPORAL_ADDRESS="replay-2024-demo.sdvdw.tmprl.cloud:7233" \
#            -e TEMPORAL_NAMESPACE="replay-2024-demo.sdvdw" \
#            -e TEMPORAL_CLIENT_CERT_PATH="replay-2024-demo.sdvdw.crt" \
#            -e TEMPORAL_CLIENT_KEY_PATH="replay-2024-demo.sdvdw.key" \
#            -e TEMPORAL_TASK_QUEUE="game" \
#            -e TEMPORAL_WORKFLOW_TYPE="GameWorkflow" \
#            -p 5173:5173 \
#            temporal-replay-demo-2024-game-ui