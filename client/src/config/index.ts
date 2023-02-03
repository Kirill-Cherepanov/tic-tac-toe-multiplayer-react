// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HEROKU_BACKEND = 'https://lit-citadel-75107.herokuapp.com';
const FLY_IO_BACKEND = 'https://tic-tac-toe-multiplayer.fly.dev';
const LOCAL_BACKEND = 'http://localhost:8080';

export const API_URL =
  process.env.NODE_ENV === 'development' ? LOCAL_BACKEND : FLY_IO_BACKEND;
