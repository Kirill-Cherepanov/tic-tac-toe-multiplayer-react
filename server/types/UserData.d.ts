type SearchParams = {
  matchTime: {
    value: number;
    strict: boolean;
  };
  breakTime: {
    value: number;
    strict: boolean;
  };
};

// type SessionData = {
//   socketID: string;
//   username: string;
//   invited: boolean;
//   wasInvited: boolean;
// };

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

type Players = {
  [socketID: string]: PlayerData;
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

type Games = {
  [socketID: string]: {
    players: {
      [socketID: string]: string;
    };
    currentGame: BoardMoves;
  };
};

type DbData = {
  players: Players;
  games: Games;
};
