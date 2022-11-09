FROM node:19-alpine

ARG API_PORT=8080

ENV NODE_ENV production
ENV PORT ${API_PORT}

RUN mkdir /tic-tac-toe-api
WORKDIR /tic-tac-toe-api

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
RUN npm run build

EXPOSE ${API_PORT}

CMD [ "npm", "run", "production" ]
