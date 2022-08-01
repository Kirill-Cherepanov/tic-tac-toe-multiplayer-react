import fs from 'fs/promises';
import { Socket } from 'socket.io';

export function updateDb(dbData: DbData): Promise<void> {
  return fs.writeFile('dist/CurrentPlayers.json', JSON.stringify(dbData));
}

export async function readDb(): Promise<DbData> {
  try {
    const dbJson = (await fs.readFile('dist/CurrentPlayers.json')).toString(
      'utf-8'
    );
    const dbData = <DbData>JSON.parse(dbJson);
    return dbData;
  } catch (e) {
    throw 'Error in readDb:\n' + e;
  }
}

export function areSearchParamsCompatible(
  params1: SearchParams,
  params2: SearchParams
): boolean {
  for (let i = 0; i < Object.values(params1).length; i++) {
    const param1 = Object.values(params1)[i];
    const param2 = Object.values(params2)[i];

    if (
      (param1.strict === true && param1.value !== param2.value) ||
      (param2.strict === true && param1.value !== param2.value)
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
  searchParams: SearchParams,
  UPDATE_SESSION_TIME: number
) => void;

type SearchUpdater = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  searchParams: SearchParams,
  UPDATE_SESSION_TIME: number
) => void;

export const searchUpdater: SearchUpdater = (() => {
  let currentId = 0;

  const searchUpdate: SearchUpdate = async (
    id,
    socket,
    searchParams,
    UPDATE_SESSION_TIME
  ) => {
    const dbData = await readDb();
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
      searchUpdate(id, socket, searchParams, UPDATE_SESSION_TIME);
    }, UPDATE_SESSION_TIME);
  };

  return (socket, searchParams, UPDATE_SESSION_TIME) => {
    searchUpdate(++currentId, socket, searchParams, UPDATE_SESSION_TIME);
  };
})();

export function deleteFromSearch(dbData: DbData, socketID: string): void {
  if (dbData.players[socketID] === undefined) {
    return;
    // const errorMessage = `Can not delete the user ${socketID}.\nThere is no such user in\n${dbData.players}!`;
    // throw Error(errorMessage);
  }

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
    Object.keys(dbData.players).includes(socketID) &&
    (username === '' || dbData.players[socketID].username === username)
  );
}

export function isUserInGame(
  dbData: DbData,
  socketID: string
): string | boolean {
  const games = Object.values(dbData.games);
  let room: string | undefined;

  for (let game of games) {
    if (Object.keys(game.players).includes(socketID)) {
      room = Object.keys(game.players)[1];
    }
  }

  return room || false;
}

// export function cancelGame(
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
//   io.to(opponent[0]).emit('dismissGame', 'need to write some stuff');

//   delete dbData.games[room_id];
// }
