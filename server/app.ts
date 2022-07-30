import { Server, Socket } from 'socket.io';
import fs from 'fs/promises';
import http from 'http';

const httpServer = http.createServer();

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: [
      'https://zesty-gecko-26d2c4.netlify.app/',
      'http://127.0.0.1:8080'
    ],
    methods: ['GET']
  }
});

io.on('connection', (socket) => socket.emit('enterSuccess'));

httpServer.listen(Number(process.env.PORT) || 3000);
