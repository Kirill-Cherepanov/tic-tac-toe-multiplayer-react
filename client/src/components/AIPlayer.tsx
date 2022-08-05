import React, { useCallback, useEffect, useState } from 'react';
import GameBoard from './GameBoard';
import capitalize from '../utilities/capitalize';
import {
  getBestMove,
  getRandomMove,
  checkDraw,
  checkWin
} from '../utilities/ticTacToe';

type Props = { setGameMode: React.Dispatch<React.SetStateAction<string>> };

const CHANCE_OF_RANDOM_MOVE = [1, 0.25, 0];

export default function AIPlayer({ setGameMode }: Props) {
  const [difficulty, setDifficulty] = useState(-1);
  const [side, setSide] = useState('o');
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
      setCurrentMove('o');
      setSide((side) => (side === 'o' ? 'x' : 'o'));
    }
  });

  const checkGameOver = (move: string, cellsMarks: string[]) => {
    const isWin = checkWin(move, cellsMarks);
    const isDraw = checkDraw(cellsMarks);

    if (!isWin && !isDraw) return false;

    const messageText = isWin
      ? `${move === 'x' ? 'Cross' : 'Circle'} player wins!`
      : 'Draw!';

    setEndMessage((endMessage) => {
      return {
        ...endMessage,
        ...{
          hidden: false,
          messageText: messageText
        }
      };
    });

    return true;
  };

  const makeAiMove = useCallback(
    (move: string) => {
      setCellsMarks((cellsMarks) => {
        let pos: number;

        if (Math.random() <= CHANCE_OF_RANDOM_MOVE[difficulty]) {
          pos = getRandomMove([...cellsMarks]);
        } else pos = getBestMove([...cellsMarks], move);

        const newCellsMarks = [
          ...cellsMarks.slice(0, pos),
          move,
          ...cellsMarks.slice(pos + 1)
        ];

        return newCellsMarks;
      });

      setCurrentMove(side);
    },
    [difficulty, side]
  );

  const makeMove = (pos: number) => {
    if (cellsMarks[pos]) return;
    if (currentMove !== side) return;

    const newCellsMarks = [
      ...cellsMarks.slice(0, pos),
      currentMove,
      ...cellsMarks.slice(pos + 1)
    ];
    const newCurrentMove = currentMove === 'o' ? 'x' : 'o';

    setCellsMarks(newCellsMarks);
    setCurrentMove(newCurrentMove);
  };

  useEffect(() => {
    const prevMove = currentMove === 'x' ? 'o' : 'x';
    if (checkGameOver(prevMove, cellsMarks)) {
      console.log('over');
      return;
    }

    if (side !== currentMove) makeAiMove(currentMove);
  }, [cellsMarks, currentMove, makeAiMove, side]);

  return (
    <>
      <GameBoard
        className={side}
        cellClickHandler={makeMove}
        cellsMarks={cellsMarks}
        endMessageProps={endMessage}
      />
      {difficulty !== -1 ? null : (
        <div className="end-message show">
          <div className="end-text">Choose difficulty</div>
          <button id="restart-button" onClick={() => setDifficulty(3)}>
            Impossible
          </button>
          <button id="restart-button" onClick={() => setDifficulty(2)}>
            Hard
          </button>
          <button id="restart-button" onClick={() => setDifficulty(1)}>
            Normal
          </button>
          <button id="restart-button" onClick={() => setDifficulty(0)}>
            Easy
          </button>
        </div>
      )}
      <div className="game-mode">
        {['single', 'multi', 'ai'].map((mode) => {
          return (
            <button
              id={`${mode}-button`}
              className={'game-mode-btn' + (mode === 'ai' ? ' active' : '')}
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
