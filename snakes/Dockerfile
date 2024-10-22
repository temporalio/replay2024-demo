FROM node:18 AS engine

RUN npm install -g typescript ts-node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY .svelte-kit .svelte-kit

CMD ["npm", "run", "host"]
