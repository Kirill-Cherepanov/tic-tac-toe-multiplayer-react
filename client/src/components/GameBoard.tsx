type GameBoardProps = {
  className: string;
  cellClickHandler: (positon: number) => void;
  cellsMarks: string[];
  endMessageProps: {
    hidden: boolean;
    buttonText: string;
    messageText: string;
    onClick: () => void;
  };
};

export default function GameBoard({
  className,
  cellClickHandler,
  cellsMarks,
  endMessageProps,
}: GameBoardProps) {
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

      <div className={'end-message ' + (endMessageProps.hidden ? '' : 'show')}>
        <div className="end-text">{endMessageProps.messageText}</div>
        <button id="restart-button" onClick={endMessageProps.onClick}>
          {endMessageProps.buttonText}
        </button>
      </div>
    </>
  );
}
