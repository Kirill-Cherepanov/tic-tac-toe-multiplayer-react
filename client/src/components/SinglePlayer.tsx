import React, { useEffect, useState } from 'react';

import GameBoard from './GameBoard';
import capitalize from '../utilities/capitalize';
import { checkDraw, checkWin } from '../utilities/ticTacToe';

type SinglePlayerProps = {
  setGameMode: React.Dispatch<React.SetStateAction<string>>;
};

export default function SinglePlayer({ setGameMode }: SinglePlayerProps) {
  const [currentMove, setCurrentMove] = useState('o');
  const [cellsMarks, setCellsMarks] = useState(Array<string>(9).fill(''));
  const [endMessage, setEndMessage] = useState({
    hidden: true,
    buttonText: 'Restart',
    messageText: '',
    onClick: () => {
      setCellsMarks(Array<string>(9).fill(''));
      setEndMessage((endMessage) => {
        return { ...endMessage, ...{ hidden: true } };
      });
    },
  });

  useEffect(() => {
    const prevMove = currentMove === 'o' ? 'x' : 'o';
    const isWin = checkWin(prevMove, cellsMarks);
    const isDraw = checkDraw(cellsMarks);

    if (!isWin && !isDraw) return;

    setCurrentMove(() => {
      const shouldSwap = cellsMarks.filter((mark) => mark).length % 2 === 0;
      return shouldSwap ? prevMove : currentMove;
    });

    const messageText = isWin
      ? `${prevMove === 'x' ? 'Cross' : 'Circle'} player wins!`
      : 'Draw!';

    setEndMessage((endMessage) => {
      return {
        ...endMessage,
        ...{
          hidden: false,
          messageText: messageText,
        },
      };
    });
  }, [cellsMarks, currentMove]);

  return (
    <>
      <GameBoard
        className={currentMove}
        cellClickHandler={(pos: number) => {
          if (cellsMarks[pos]) return;

          setCellsMarks((cellsMarks) => [
            ...cellsMarks.slice(0, pos),
            currentMove,
            ...cellsMarks.slice(pos + 1),
          ]);
          setCurrentMove((currentMove) => (currentMove === 'o' ? 'x' : 'o'));
        }}
        cellsMarks={cellsMarks}
        endMessageProps={endMessage}
      />
      <div className="game-mode">
        {['single', 'multi', 'ai'].map((mode) => {
          return (
            <button
              id={`${mode}-button`}
              className={'game-mode-btn' + (mode === 'single' ? ' active' : '')}
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
