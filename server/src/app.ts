import { Server } from 'socket.io';
import Timer from './Timer';
import http from 'http';
import dbData from './CurrentPlayers';

import { deleteFromArray } from './Utils';

import {
  getSearchUpdater,
  updateUser,
  deleteFromSearch,
  isUserInSearch,
  isUserInGame,
  areSearchParamsCompatible,
  calculateGameParams
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

const UPDATE_SEARCH_TIME = 1000;

const timers: {
  [sockedID: string]: Timer;
} = {};

io.on('connection', (socket) => {
  const searchUpdater = getSearchUpdater();

  socket.on('enter', (username) => {
    if (isUserInSearch(dbData, socket.id, username)) {
      socket.emit('enterFailure', 'username already exists');
      return;
    }
    socket.emit('enterSuccess');

    [
      'changeSearchParams',
      'leaveSearch',
      'invite',
      'cancelInvite',
      'acceptInvite',
      'disconnect'
    ].forEach((event) => socket.removeAllListeners(event));

    socket.on('changeSearchParams', (searchParams) => {
      updateUser(dbData, socket.id, username, searchParams);
      searchUpdater(socket, dbData, searchParams, UPDATE_SEARCH_TIME);
    });

    socket.on('leaveSearch', () => {
      deleteFromSearch(dbData, socket.id);
    });

    socket.on('invite', (invitee) => {
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
      if (!dbData.players[invitee].wasInvited.includes(socket.id)) {
        dbData.players[invitee].wasInvited.push(socket.id);
      }
    });

    socket.on('cancelInvite', (inviter, wasInvited) => {
      if (!isUserInSearch(dbData, inviter)) return;

      const socketData = dbData.players[socket.id];
      const inviterData = dbData.players[inviter];

      if (wasInvited) {
        socketData.invited = deleteFromArray(socketData.invited, inviter);
        inviterData.wasInvited = deleteFromArray(
          inviterData.wasInvited,
          socket.id
        );
      } else {
        socketData.wasInvited = deleteFromArray(socketData.wasInvited, inviter);
        inviterData.invited = deleteFromArray(inviterData.invited, socket.id);
      }
    });

    socket.on('acceptInvite', (inviter) => {
      if (!isUserInSearch(dbData, inviter)) return;
      if (!dbData.players[inviter].invited.includes(socket.id)) return;

      const { breakTime, matchTime } = calculateGameParams(
        dbData.players[socket.id].searchParams,
        dbData.players[inviter].searchParams
      );

      const room: GameData = {
        players: {
          [socket.id]: dbData.players[socket.id].username,
          [inviter]: dbData.players[inviter].username
        },
        currentGame: Array(9).fill(null) as BoardMoves,
        currentMove: 'o',
        breakTime,
        matchTime
      };
      dbData.games[inviter] = room;

      deleteFromSearch(dbData, inviter);
      deleteFromSearch(dbData, socket.id);

      socket.emit('openRoom', breakTime, matchTime, room.players[inviter]);

      io.to(inviter).emit(
        'openRoom',
        breakTime,
        matchTime,
        room.players[socket.id]
      );

      timers[socket.id] = new Timer();
      timers[inviter] = new Timer();
      timers[socket.id].start((breakTime + 1) * 1000, () => {
        socket.emit('dismissGame', 'Ran out of break time');
        io.to(inviter).emit('dismissGame', 'Ran out of break time');
        delete dbData.games[inviter];
      });
    });

    socket.on('disconnect', () => {
      deleteFromSearch(dbData, socket.id);
      // if (userInGame) cancelGame();
    });
  });
});

httpServer.listen(Number(process.env.PORT) || 8080);
