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
      'http://127.0.0.1:3000',
      'http://localhost:3000'
    ],
    methods: ['GET']
  }
});

io.on('connection', (socket) => {
  socket.on('test', () => {
    console.log('server test passed');
    socket.emit('test');
  });
});

httpServer.listen(Number(process.env.PORT) || 8080);
