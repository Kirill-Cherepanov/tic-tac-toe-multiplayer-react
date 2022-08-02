import { Server, Socket } from 'socket.io';
import Timer from './Timer';
import http from 'http';
import dbData from './CurrentPlayers';

import { deleteFromArray } from './Utils';

import {
  getSearchUpdater,
  updateUser,
  deleteFromSearch,
  isUserInSearch,
  areSearchParamsCompatible,
  calculateGameParams,
  getGameData
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
  [socketID: string]: Timer;
} = {};

io.on('connection', (socket) => {
  const searchUpdater = getSearchUpdater();

  socket.on('enter', (username) => {
    if (isUserInSearch(dbData, socket.id, username)) {
      socket.emit('enterFailure', 'username already exists');
      return;
    }
    socket.emit('enterSuccess');

    socket.removeAllListeners('changeSearchParams');

    socket.on('changeSearchParams', (searchParams) => {
      updateUser(dbData, socket.id, username, searchParams);
      searchUpdater(socket, dbData, searchParams, UPDATE_SEARCH_TIME);
    });
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
      inviter: {
        id: inviter,
        username: dbData.players[inviter].username
      },
      invitee: {
        id: socket.id,
        username: dbData.players[socket.id].username
      },
      currentBoard: Array(9).fill(null) as BoardMoves,
      currentMove: inviter,
      breakTime,
      matchTime
    };
    dbData.games[inviter] = room;

    deleteFromSearch(dbData, inviter);
    deleteFromSearch(dbData, socket.id);

    socket.emit('openRoom', breakTime, matchTime, room.inviter.username);
    io.to(inviter).emit(
      'openRoom',
      breakTime,
      matchTime,
      room.invitee.username
    );

    timers[socket.id] = new Timer();
    timers[inviter] = new Timer();
    startBreak(socket.id, inviter, inviter, breakTime);
  });

  socket.on('leaveGame', () => leaveGame(dbData, socket.id));

  socket.on('ready', function initial() {
    const gameData = getGameData(dbData, socket.id);
    if (gameData === undefined) return;
    const { opponent } = gameData;

    io.to(opponent.id).emit('opponentReady');

    socket.on('ready', function restartMatch() {
      // socket.emit('opponentReady');
      io.to(opponent.id).emit('opponentReady');

      startGame(socket.id);

      socket.on('ready', initial);
      socket.off('ready', restartMatch);
    });

    socket.off('ready', initial);
  });

  socket.on('move', (pos) => {
    handleMove(pos, socket);
  });

  socket.on('disconnect', () => {
    deleteFromSearch(dbData, socket.id);
    leaveGame(dbData, socket.id);
  });
});

httpServer.listen(Number(process.env.PORT) || 8080);

function startBreak(
  inviter: string,
  invitee: string,
  gameID: string,
  breakTime: number
): void {
  timers[invitee].reset();
  timers[inviter].reset();

  timers[inviter].start((breakTime + 1) * 1000, () => {
    io.to(invitee).emit('dismissGame', 'Ran out of break time');
    io.to(inviter).emit('dismissGame', 'Ran out of break time');
    delete dbData.games[inviter];
  });
}

function startGame(socketID: string) {
  const { inviter, invitee, matchTime, gameID, breakTime } = getGameData(
    dbData,
    socketID
  )!;

  io.to(inviter.id).emit('startGame', true);
  io.to(invitee.id).emit('startGame', false);

  timers[inviter.id].start((matchTime + 1) * 1000, () => {
    startBreak(inviter.id, invitee.id, gameID, breakTime);

    io.to(inviter.id).emit('gameOver', invitee.username);
    io.to(invitee.id).emit('gameOver', invitee.username);
  });

  timers[invitee.id].start((matchTime + 1) * 1000, () => {
    startBreak(inviter.id, invitee.id, gameID, breakTime);

    io.to(inviter.id).emit('gameOver', inviter.username);
    io.to(invitee.id).emit('gameOver', inviter.username);
  });
}

function handleMove(
  pos: number,
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  const WINNING_COMBINATIONS = [
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const game = getGameData(dbData, socket.id);
  if (game === undefined) return;
  const {
    opponent,
    username,
    invitee,
    inviter,
    gameID,
    breakTime,
    currentBoard,
    currentMove
  } = game;
  if (currentMove !== socket.id) return;

  const checkWin = () => {
    return WINNING_COMBINATIONS.some((combination) => {
      return combination.every((pos) => currentBoard[pos] === currentMove);
    });
  };

  const checkDraw = () => currentBoard.every((mark) => mark);

  const makeMove = () => {
    dbData.games[gameID].currentMove = opponent.id;
    dbData.games[gameID].currentBoard[pos] = socket.id;
  };

  // Check if the move is illegal, i.e. if the move position is already marked
  if (currentBoard[pos]) {
    startBreak(inviter.id, invitee.id, gameID, breakTime);
    io.to(opponent.id).emit(
      'gameOver',
      opponent.username,
      `${username} has made an illegal move. ${opponent.username} wins!`
    );
    socket.emit(
      'gameOver',
      opponent.username,
      `${username} has made an illegal move. ${opponent.username} wins!`
    );
    return;
  }

  makeMove();
  io.to(opponent.id).emit('opponentMove', pos);

  if (checkWin()) {
    io.to(opponent.id).emit('gameOver', username);
    socket.emit('gameOver', username, 'You win!');
    startBreak(inviter.id, invitee.id, gameID, breakTime);
    return;
  }

  if (checkDraw()) {
    io.to(opponent.id).emit('gameOver', 'Friendship', 'Draw!');
    socket.emit('gameOver', 'Friendship', 'Draw!');
    startBreak(inviter.id, invitee.id, gameID, breakTime);
    return;
  }

  timers[socket.id].pause();
  timers[opponent.id].resume();
}

export function leaveGame(dbData: DbData, socketID: string): void {
  const game = getGameData(dbData, socketID);
  if (game === undefined) return;
  const { gameID, opponent } = game;

  io.to(opponent.id).emit('dismissGame', 'Opponent has left the game');
  delete dbData.games[gameID];
}
