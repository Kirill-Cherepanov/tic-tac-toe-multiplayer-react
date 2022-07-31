interface ServerToClientEvents {
  enterSuccess: () => void;
  enterFailure: (message: string) => void;
  searchUpdate: (sessionData: SessionsData) => void;
  openRoom: (breakTime: number, matchTime: number, opponent: string) => void;

  opponentReady: () => void;
  startGame: (isFirstMove: boolean) => void;

  opponentMove: (position: number) => void;
  randomMove: (cellMarks: string[]) => void;
  gameOver: (winner: string) => void;
  dismissGame: (message: string) => void;
}

interface ClientToServerEvents {
  enter: (username: string) => void;
  leaveSearch: () => void;
  changeSearchParams: (searchParams: {
    matchTime: { value: number; strict: boolean };
    breakTime: { value: number; strict: boolean };
  }) => void;

  invite: (invited: string) => void; // Here we send socketID of the invited
  cancelInvite: (inviter: string, wasInvited: boolean) => void;
  acceptInvite: (inviter: string) => void;

  ready: () => void;
  move: (position: number) => void;
  leaveGame: () => void;
}

interface InterServerEvents {}

interface SocketData {}
