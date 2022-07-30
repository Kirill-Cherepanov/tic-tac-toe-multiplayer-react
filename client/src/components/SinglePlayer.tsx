import React, { useState } from 'react';
import GameBoard from './GameBoard';

type Props = { setGameMode: React.Dispatch<React.SetStateAction<string>> };

const WIN_COMBINATIONS = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export default function SinglePlayer({ setGameMode }: Props) {
  const [currentMove, setCurrentMove] = useState('o');
  const [cellsMarks, setCellsMarks] = useState(Array<string>(9).fill(''));

  return (
    <>
      <GameBoard
        className={currentMove}
        cellClickHandler={(pos: number) => {
          if (cellsMarks[pos]) return;
          setCellsMarks((cellsMarks) => [
            ...cellsMarks.slice(0, pos),
            currentMove,
            ...cellsMarks.slice(pos + 1)
          ]);
          setCurrentMove((currentMove) => (currentMove === 'o' ? 'x' : 'o'));
        }}
        cellsMarks={cellsMarks}
      />
      <div className="game-mode">
        {['single', 'multi', 'ai'].map((mode) => {
          return (
            <button
              id={`${mode}-button`}
              className="game-mode-btn active"
              key={mode}
              onClick={() => {
                setGameMode(mode);
              }}
            >
              <i className={`game-mode-icon ${mode}-icon`}></i>
              <label className="game-mode-label">
                {capitalize(mode === 'ai' ? 'ai' : mode + 'player')}
              </label>
            </button>
          );
        })}
      </div>
    </>
  );
}

const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
