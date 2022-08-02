import { Socket, Server } from 'socket.io';

// export function updateDb(dbData: DbData): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const databaseWrite = fs.createWriteStream(
//       'dist/CurrentPlayers.json',
//       'utf-8'
//     );
//     databaseWrite.write(JSON.stringify(dbData));
//     databaseWrite.end();
//     databaseWrite.on('finish', resolve);
//     databaseWrite.on('error', reject);
//   });
// }

// export async function readDb(): Promise<DbData> {
//   // const a: DbData = await databaseRead.read()

//   let dbJson: string = '';
//   try {
//     dbJson = (await fsPromises.readFile('dist/CurrentPlayers.json')).toString(
//       'utf-8'
//     );
//     return <DbData>JSON.parse(dbJson);
//   } catch (e) {
//     console.log('DBJSON: "' + dbJson + '"\n\n');
//     throw 'Error in readDb:\n' + e;
//   }
// }

export function areSearchParamsCompatible(
  params1: SearchParams,
  params2: SearchParams
): boolean {
  for (let i = 0; i < Object.values(params1).length; i++) {
    const param1 = Object.values(params1)[i];
    const param2 = Object.values(params2)[i];

    if (
      (param1.strict === true || param2.strict === true) &&
      param1.value !== param2.value
    ) {
      return false;
    }
  }
  return true;
}

export function updateUser(
  dbData: DbData,
  socketID: string,
  username: string,
  searchParams: SearchParams
): void {
  const prevData: PlayerData = JSON.parse(
    JSON.stringify(dbData.players[socketID]) || 'null'
  );
  dbData.players[socketID] = {
    username: username,
    invited: [],
    wasInvited: [],
    searchParams
  };

  if (prevData === null) return;

  prevData.wasInvited.forEach((inviter) => {
    if (
      areSearchParamsCompatible(
        dbData.players[inviter].searchParams,
        searchParams
      )
    ) {
      dbData.players[socketID].wasInvited.push(inviter);
    } else {
      dbData.players[inviter].invited = dbData.players[inviter].invited.filter(
        (invitee) => invitee === socketID
      );
    }
  });
  prevData.invited.forEach((invitee) => {
    if (
      areSearchParamsCompatible(
        dbData.players[invitee].searchParams,
        searchParams
      )
    ) {
      dbData.players[socketID].invited.push(invitee);
    } else {
      dbData.players[invitee].wasInvited = dbData.players[
        invitee
      ].wasInvited.filter((inviter) => inviter === socketID);
    }
  });
}

type SearchUpdate = (
  id: number,
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  dbData: DbData,
  searchParams: SearchParams,
  UPDATE_SEARCH_TIME: number
) => void;

type SearchUpdater = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  dbData: DbData,
  searchParams: SearchParams,
  UPDATE_SEARCH_TIME: number
) => void;

export const getSearchUpdater = (): SearchUpdater =>
  ((): SearchUpdater => {
    let currentId = 0;

    const searchUpdate: SearchUpdate = async (
      id,
      socket,
      dbData,
      searchParams,
      UPDATE_SEARCH_TIME
    ) => {
      if (!isUserInSearch(dbData, socket.id)) return;

      const sessionsData: SessionsData = Object.fromEntries(
        Object.entries(dbData.players)
          .filter((player) => player[0] !== socket.id)
          .filter((player) =>
            areSearchParamsCompatible(searchParams, player[1].searchParams)
          )
          .map((player) => [
            player[0],
            {
              username: player[1].username,
              invited: player[1].invited.includes(socket.id),
              wasInvited: player[1].wasInvited.includes(socket.id)
            }
          ])
      );
      socket.emit('searchUpdate', sessionsData);

      setTimeout(() => {
        if (id !== currentId) return;
        searchUpdate(id, socket, dbData, searchParams, UPDATE_SEARCH_TIME);
      }, UPDATE_SEARCH_TIME);
    };

    return (socket, dbData, searchParams, UPDATE_SEARCH_TIME) => {
      searchUpdate(
        ++currentId,
        socket,
        dbData,
        searchParams,
        UPDATE_SEARCH_TIME
      );
    };
  })();

export function deleteFromSearch(dbData: DbData, socketID: string): void {
  if (dbData.players[socketID] === undefined) return;

  for (let invited of dbData.players[socketID].invited) {
    if (dbData.players[invited] === undefined) continue;

    dbData.players[invited].wasInvited.splice(
      dbData.players[invited].wasInvited.indexOf(socketID),
      1
    );
  }
  for (let inviter of dbData.players[socketID].invited) {
    if (dbData.players[inviter] === undefined) continue;

    dbData.players[inviter].invited.splice(
      dbData.players[inviter].invited.indexOf(socketID),
      1
    );
  }

  delete dbData.players[socketID];
  return;
}

export function isUserInSearch(
  dbData: DbData,
  socketID: string,
  username: string = ''
): boolean {
  return (
    (Object.keys(dbData.players).includes(socketID) && username === '') ||
    !!Object.values(dbData.players).find(
      (player) => player.username === username
    )
  );
}

// export function isUserInGame(
//   dbData: DbData,
//   socketID: string
// ): string | boolean {
//   const games = Object.values(dbData.games);
//   let room: string | undefined;

//   for (let game of games) {
//     if (Object.keys(game.players).includes(socketID)) {
//       room = Object.keys(game.players)[1];
//     }
//   }

//   return room || false;
// }

export function calculateGameParams(
  params1: SearchParams,
  params2: SearchParams
) {
  const calcTimeValue = (value1: number, value2: number) => {
    if (value1 === 0 && value2 === 0) return 100000;

    // So basically if one of timings is unlimited - i.e. 0 - and the other one isn't
    // then we treat unlimited as 60 in calculations
    return Math.ceil(((value1 || 60) + (value2 || 60)) / 2);
  };

  const breakTime: number = calcTimeValue(
    params1.breakTime.value,
    params2.breakTime.value
  );
  const matchTime: number = calcTimeValue(
    params1.matchTime.value,
    params2.matchTime.value
  );

  return { breakTime, matchTime };
}

export function getGameData(dbData: DbData, socketID: string) {
  const game = Object.entries(dbData.games).find((game) => {
    return game[1].invitee.id === socketID || game[1].inviter.id === socketID;
  });
  if (!game) return;
  const [gameID, gameData] = game;

  return {
    gameID: gameID,
    username:
      gameData.invitee.id === socketID
        ? gameData.invitee.username
        : gameData.inviter.username,
    opponent:
      gameData.invitee.id === socketID ? gameData.inviter : gameData.invitee,
    invitee: gameData.invitee,
    inviter: gameData.inviter,
    breakTime: gameData.breakTime,
    matchTime: gameData.matchTime,
    currentMove: gameData.currentMove,
    currentBoard: gameData.currentBoard
  };
}

export function checkMove(
  dbData: DbData,
  socketID: string,
  pos: number
): boolean | 'WIN' | 'DRAW' | null {
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
  const checkWin = (currentMove: string, cellsMarks: string[]) => {
    return WINNING_COMBINATIONS.some((combination) => {
      return combination.every((pos) => cellsMarks[pos] === currentMove);
    });
  };

  // Doens't seem very good
  const game = getGameData(dbData, socketID);
  if (game === undefined) return null;
  const { currentBoard, currentMove } = game;
  if (socketID !== currentMove) return null;
  if (currentBoard[pos]) return false;
  if (currentBoard.every((mark) => mark)) return 'DRAW';
  if (checkWin(currentMove, currentBoard)) return 'WIN';
  else return true;
}

// export function dismissGame(
//   dbData: DbData,
//   socketID: string,
//   isDisconnected: boolean
// ): void {
//   let room_id: string | undefined;
//   let opponent: [string, string] | undefined;
//   let username: string | undefined;

//   for (let game of Object.entries(dbData.games)) {
//     if (Object.keys(game[1].players).includes(socketID)) {
//       room_id = game[0];
//       opponent = Object.entries(game[1].players).filter(
//         (i) => i[0] !== socketID
//       )[0];
//       username = game[1].players[socketID];
//     }
//   }
//   if (
//     opponent === undefined ||
//     room_id === undefined ||
//     username === undefined
//   ) {
//     const errorMessage = `Can not delete the user ${socketID}.\nThere is no such user in\n${JSON.stringify(
//       dbData.games
//     )}!`;
//     throw Error(errorMessage);
//   }

//   if (!isDisconnected) {
//     dbData.players[socketID] = {
//       username: username,
//       invited: [],
//       wasInvited: []
//     };
//   }

//   dbData.players[opponent[0]] = {
//     username: opponent[1],
//     invited: [],
//     wasInvited: []
//   };

//   delete dbData.games[room_id];
// }
