import { Server, Socket } from 'socket.io';
import fs from 'fs/promises';
import Timer from './Timer';
import http from 'http';

import {
  updateDb,
  readDb,
  searchUpdater,
  updateUser,
  deleteUser,
  isUserInSearch,
  isUserInGame
} from './Utilities';

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
      'http://192.168.100.2:3000',
      'http://localhost:3000',
      'http://37.214.72.201:3000',
      'http://37.214.72.201',
      '37.214.72.201:3000',
      '37.214.72.201'
    ],
    methods: ['GET']
  }
});

const UPDATE_SESSION_TIME = 1000;

io.on('connection', (socket) => {
  socket.on('enter', async (username) => {
    if (isUserInSearch(await readDb(), socket.id, username)) {
      socket.emit('enterFailure', 'username already exists');
      return;
    }
    socket.emit('enterSuccess');

    const timer = new Timer();

    socket.on('changeSearchParams', async (searchParams) => {
      updateUser(await readDb(), socket.id, username, searchParams);
      searchUpdater(socket, searchParams, UPDATE_SESSION_TIME);
    });
  });
});

httpServer.listen(Number(process.env.PORT) || 8080);
