type Timings = 5 | 10 | 20 | 40 | 0;

type SearchParams = {
  matchTime: {
    value: Timings;
    strict: boolean;
  };
  breakTime: {
    value: Timings;
    strict: boolean;
  };
};

type SessionsData = {
  [socketID: string]: {
    username: string;
    invited: boolean;
    wasInvited: boolean;
  };
};

type PlayerData = {
  username: string;
  invited: string[];
  wasInvited: string[];
  searchParams: SearchParams;
};

type BoardMoves = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

type GameData = {
  players: {
    [socketID: string]: string;
  };
  currentGame: BoardMoves;
  currentMove: 'o' | 'x';
  matchTime: number;
  breakTime: number;
};

type DbData = {
  players: {
    [socketID: string]: PlayerData;
  };
  games: {
    [socketID: string]: GameData;
  };
};
