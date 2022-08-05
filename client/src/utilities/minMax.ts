export default function getBestMove(cellsMarks: string[]) {
  if (cellsMarks.every((mark) => !mark)) return Math.floor(Math.random() * 10);
  return 0;
}
