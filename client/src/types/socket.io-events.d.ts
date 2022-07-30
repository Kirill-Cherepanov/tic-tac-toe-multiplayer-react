interface ServerToClientEvents {
  test: () => void;

  enterSuccess: () => void;
  enterFailure: (message: string) => void;
  sessionsupdate: (sessionData: SessionData[]) => void;
  invite: (inviter: string) => void; // Here we send socketID of the inviter
  startGame: (opponent: string, xTurn: boolean) => void;

  // changeMoveTime: (time: number) => void;
  pause: (time: number) => void;
  move: (position: number) => void;
  timeIsUp: (isDefeat: boolean) => void;
  restartMatch: () => void;
  gameOver: () => void;
}

interface ClientToServerEvents {
  test: () => void;

  enter: (username: string) => void;
  invite: (invited: string) => void; // Here we send socketID of the invited
  acceptInvite: (inviter: string) => void;
  cancelInvite: (inviter: string, wasInvited: boolean) => void;

  // changeMoveTime: (time: number) => void;
  timeout: (time?: number) => void;
  move: (position: number) => void;
  restartMatch: () => void;
  leaveGame: () => void;
}

interface InterServerEvents {}

// To share information between servers
interface SocketData {}

type StandartSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
