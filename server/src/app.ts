import { Server, Socket } from 'socket.io';
import fs from 'fs/promises';
import Timer from './Timer';
import http from 'http';

import { deleteFromArray } from './Utils';

import {
  updateDb,
  readDb,
  searchUpdater,
  updateUser,
  deleteFromSearch,
  isUserInSearch,
  isUserInGame,
  areSearchParamsCompatible
} from './DbManipulation';

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

    // const timer = new Timer();

    socket.on('changeSearchParams', async (searchParams) => {
      const dbData = await readDb();
      updateUser(dbData, socket.id, username, searchParams);
      await updateDb(dbData);
      searchUpdater(socket, searchParams, UPDATE_SESSION_TIME);
    });

    socket.on('leaveSearch', async () => {
      const dbData = await readDb();
      deleteFromSearch(dbData, socket.id);
    });

    socket.on('invite', async (invitee) => {
      const dbData = await readDb();
      if (
        !isUserInSearch(dbData, invitee) ||
        !areSearchParamsCompatible(
          dbData.players[socket.id].searchParams,
          dbData.players[invitee].searchParams
        )
      ) {
        return;
      }

      // These checks might be redundant but better safe than sorry imo
      if (!dbData.players[socket.id].invited.includes(invitee)) {
        dbData.players[socket.id].invited.push(invitee);
      }
      if (!dbData.players[socket.id].invited.includes(invitee)) {
        dbData.players[invitee].wasInvited.push(socket.id);
      }
    });

    socket.on('cancelInvite', async (inviter, wasInvited) => {
      const dbData = await readDb();
      if (!isUserInSearch(dbData, inviter)) return;

      if (wasInvited) {
        deleteFromArray(dbData.players[socket.id].invited, inviter);
        deleteFromArray(dbData.players[inviter].wasInvited, socket.id);
      } else {
        deleteFromArray(dbData.players[socket.id].wasInvited, inviter);
        deleteFromArray(dbData.players[inviter].invited, socket.id);
      }

      updateDb(dbData);
    });

    socket.on('acceptInvite', async (inviter) => {
      const dbData = await readDb();
      if (!isUserInSearch(dbData, inviter)) return;
      if (!dbData.players[inviter].wasInvited.includes(socket.id)) return;

      const room = {
        players: {
          [socket.id]: dbData.players[socket.id].username,
          [inviter]: dbData.players[inviter].username
        },
        currentGame: Array(9).fill(null) as BoardMoves
      };
    });

    socket.on('disconnect', async () => {
      const dbData = await readDb();
      deleteFromSearch(dbData, socket.id);
      // if (userInGame) cancelGame();
      updateDb(dbData);
    });
  });
});

httpServer.listen(Number(process.env.PORT) || 8080);
