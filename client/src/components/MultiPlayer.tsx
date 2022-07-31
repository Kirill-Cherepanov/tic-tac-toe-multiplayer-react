import React, { useCallback, useEffect, useState } from 'react';
import GameBoard from './GameBoard';
import { Socket } from 'socket.io-client';

type MultiPlayerProps = {
  breakTime: number;
  matchTime: number;
  opponent: string;
  leaveGame: () => void;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
};

export default function MultiPlayer({
  breakTime,
  matchTime,
  opponent,
  leaveGame,
  socket
}: MultiPlayerProps) {
  const [side, setSide] = useState('');
  const [currentMove, setCurrentMove] = useState('');
  const [cellsMarks, setCellsMarks] = useState(Array<string>(9).fill(''));
  const [endMessage, setEndMessage] = useState({
    hidden: false,
    buttonText: 'Ready',
    messageText: 'Are you ready?',
    onClick: () => {
      socket.emit('ready');

      setEndMessage((endMessage) => {
        return {
          ...endMessage,
          ...{ buttonText: 'Wait', messageText: 'Waiting for the opponent' }
        };
      });

      socket.on('opponentReady', () => {
        socket.emit('ready');
        socket.off('opponentReady');
      });
    }
  });

  const makeMove = useCallback(
    (pos: number) => {
      setCellsMarks((cellsMarks) => [
        ...cellsMarks.slice(0, pos),
        currentMove,
        ...cellsMarks.slice(pos + 1)
      ]);
      setCurrentMove((currentMove) => (currentMove === 'o' ? 'x' : 'o'));
    },
    [currentMove]
  );

  useEffect(() => {
    return () => {};
  }, [socket]);

  useEffect(() => {
    socket.on('startGame', (isFirstMove) => {
      setCellsMarks(Array<string>(9).fill(''));
      setEndMessage((endMessage) => {
        return {
          ...endMessage,
          ...{
            hidden: true,
            buttonText: 'Ready',
            messageText: 'Are you ready?'
          }
        };
      });
      setSide(isFirstMove ? 'o' : 'x');
      setCurrentMove('o');
    });

    socket.on('gameOver', (winner) => {
      setEndMessage((endMessage) => {
        return { ...endMessage, ...{ hidden: false } };
      });
    });

    socket.on('dismissGame', (message) => {
      setEndMessage({
        hidden: false,
        buttonText: 'Leave',
        messageText: message,
        onClick: leaveGame
      });
    });

    return () => {
      socket.off('startGame');
      socket.off('gameOver');
      socket.off('dismissGame');
    };
  }, [leaveGame, socket]);

  useEffect(() => {
    socket.on('opponentMove', (pos) => {
      makeMove(pos);
    });

    return () => {
      socket.off('opponentMove');
    };
  }, [makeMove, socket]);

  useEffect(() => {
    // We send all the cells instead of position because 'randomMove' also doubles down as a cheat detector (or rather invalid moves detector)
    // Server emits random move when time is out and when previous move was invalid
    socket.on('randomMove', (cells) => {
      setCellsMarks(cells);
      setCurrentMove(side === 'o' ? 'x' : 'o');
    });

    return () => {
      socket.off('randomMove');
    };
  }, [side, socket]);

  return (
    <>
      <GameBoard
        className={side}
        cellClickHandler={(pos) => {
          if (cellsMarks[pos] || side !== currentMove) return;

          socket.emit('move', pos);
          makeMove(pos);
        }}
        cellsMarks={cellsMarks}
        endMessageProps={endMessage}
      />
      <div className="multiplayer-options">
        <button className="options-btn" id="leave-btn" onClick={leaveGame}>
          <i className="options-icon"></i>
          <label className="options-label">Leave</label>
        </button>
      </div>
    </>
  );
}
