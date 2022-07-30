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

const sockets: {
  [id: string]: string;
} = {};

io.on('connection', (socket) => {
  sockets[socket.id] = 'timer'; // need real timer

  /*
  Search updates

  searchParams: {
    matchTime: { 
      value: 10 || 20 || 30 || 60 || Infinity, 
      strict: boolean
    },
    breakTime: 10 || 20 || 30 || 60 || Infinity,
  }

  ON: enter - accepts search parameters (which are fetched from local storage on client side). Checks whether given usename already exists in the database and sends responce based on that:
  EMIT: enterSuccess - the nickname isn't already in the db
  EMIT: enterFailure - the nickname is already in the db
  Than saves search params, updates the db and initiates searchUpdate based on them.
  EMIT: searchUpdate - reads the database and sends data based on search params.

  ON: leaveSearch - delete user from the database, trace back all the invites and delete them too.

  ON: disconnect - the same as leaveSearch but if the user is in game then leaveGame()

  ON: changeSearchParams - change search parameters.
  */

  /*
  Invitation mechanics

  ON: invite - accepts nickname of the invited player, checks if such a player exists in the database, checks if their search params are compatible, checks if such an invite hasn't already been sent and if so updates the database.

  ON: cancelInvite - accepts nickname of who's the invite being canceled (invitee) on and whether socket is the inviter or invited. Checks whether the invitee is in the database and updates the db.

  ON: acceptInvite - accepts nickname of the inviter, checks if the inviter is in the database, checks if the inviter has actually send the invite and if so creates a room (in socket.io making a room is unnecessary, we only need to change it in the db) with both players, then:
  EMIT: openRoom - sends breaktime and opponent's nickname (put `Playing against ${opponent}` above the gameboard on client side).
  Then pause(), deletes both usernames from 'Search' branch in the db (send them to 'ActiveGames' branch as a room), updates the db, declares timer and assigns it to global variable.
  */

  /*
  Gameplay mechanics

  ON: ready (1) - emits opponentReady to opponent and changes 'ON: ready (1)' listener to (2)
  ON: ready (2) - emits startGame to both players, starts the timer for the game and stops it for the player that doesn't make a move at this turn. Once the time is over, randomizes a move, emits randomMove to socket and move to opponent. Then changes listener to (1)
  EMIT: opponentReady - sends nothing.
  EMIT: startGame - sends isFirstMove.

  ON: move - Stops the timer. Checks the move's validity, if invalid randomizes the move, updates the database checks for whether the victory conditions are fullfilled, if not, emits randomMove to socket and opponentMove to opponent and starts the opponent's timer through global object, if yes, emits gameOver to both players and pause(). If valid, the same procedure but doesn't emit to socket anything.
  EMIT: opponentMove - sends the position of the move.
  EMIT: randomMove - sends the position of the move.
  EMIT: gameOver - sends victor's username and break time.

  ON: leaveGame - leaveGame(). Update the db.
  EMIT: dismissGame - sends a message of what has happened (it should be displayed until the user clicks on leave button himself while start game button should disappear).
  */

  /*
  Utils

  function pause - starts the timer on some condition (for example if the current socket is higher in alphabetical order) (condition is in place to prevent starting two timers instead of one (we don't need two timers on a break since the time is the same for both players)). Once the time is over emits dismissGame.

  function leaveGame - if socket is in the search branch, transfer him to the game branch. If opponent is in the game branch, transfer him to the search. Delete the game from the db.
  */

  socket.on('test', () => {
    console.log('server test passed');
    socket.emit('test');
  });
});

httpServer.listen(Number(process.env.PORT) || 8080);
