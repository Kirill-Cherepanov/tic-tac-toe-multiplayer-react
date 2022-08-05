export const WINNING_COMBINATIONS = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export function checkWin(currentMove: string, cellsMarks: string[]): boolean {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((pos) => cellsMarks[pos] === currentMove);
  });
}

export function checkDraw(cellsMarks: string[]): boolean {
  return cellsMarks.every((mark) => mark);
}

export function getRandomMove(cellsMarks: string[]) {
  const emptyMarks = cellsMarks
    .map((mark, i) => (mark ? null : i))
    .filter((mark) => mark !== null) as number[];
  const pos = emptyMarks[Math.floor(Math.random() * emptyMarks.length)];
  return pos;
}

export function getBestMove(cellsMarks: string[], side: string): number {
  if (cellsMarks.every((mark) => !mark)) return getRandomMove(cellsMarks);

  const opponent = side === 'o' ? 'x' : 'o';

  function minimax(cellsMarks: string[], currentSide: string) {
    type Score = {
      position: null | number;
      score: number;
    };

    const currentOpponent = currentSide === 'o' ? 'x' : 'o';

    if (checkWin(currentOpponent, cellsMarks)) {
      return {
        position: null,
        score:
          (currentSide === side ? 1 : -1) *
          (cellsMarks.filter((mark) => !mark).length + 1)
      };
    }
    if (checkDraw(cellsMarks)) return { position: null, score: 0 };

    let bestScore: Score = {
      position: null,
      score: currentSide === opponent ? Infinity : -Infinity
    };

    cellsMarks
      .filter((move) => !move)
      .forEach((move, i) => {
        const score: Score = minimax(
          [...cellsMarks.slice(0, i), currentSide, ...cellsMarks.slice(i + 1)],
          currentOpponent
        );
        score.position = i;
        if (currentSide === side && score.score > bestScore.score) {
          bestScore = score;
        } else if (currentSide === opponent && score.score < bestScore.score) {
          bestScore = score;
        }
      });

    return bestScore;
  }

  const move = minimax(cellsMarks, side).position;

  if (move === null)
    throw Error('Invalid position. The game has already ended');

  return move;
}
