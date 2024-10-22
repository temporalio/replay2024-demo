FROM node:18 AS engine

RUN npm install -g typescript ts-node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "host"]
