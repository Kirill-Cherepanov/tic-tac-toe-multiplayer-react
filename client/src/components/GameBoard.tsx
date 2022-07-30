import React from 'react';

type Props = {
  className: string;
  cellClickHandler: (positon: number) => void;
  cellsMarks: string[];
};

export default function GameBoard({
  className,
  cellClickHandler,
  cellsMarks
}: Props) {
  return (
    <>
      <div className={'gameboard ' + className}>
        {Array(9)
          .fill(0)
          .map((el, index) => (
            <div
              key={index}
              className={'cell ' + cellsMarks[index]}
              onClick={() => cellClickHandler(index)}
            />
          ))}
      </div>

      <div className="end-message">
        <div className="end-text"></div>
        <button id="restart-button" onClick={() => {}}>
          Restart
        </button>
      </div>
    </>
  );
}
