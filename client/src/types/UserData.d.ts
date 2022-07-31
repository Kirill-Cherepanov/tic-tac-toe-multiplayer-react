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

interface Players {
  [socketID: string]: {
    username: string;
    invited: string[];
    wasInvited: string[];
  };
}

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

interface Games {
  [socketID: string]: {
    players: {
      [socketID: string]: string;
    };
    currentGame: BoardMoves;
  };
}

interface DbData {
  players: Players;
  games: Games;
}
