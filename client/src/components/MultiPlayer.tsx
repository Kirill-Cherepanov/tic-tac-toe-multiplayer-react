import React, { useCallback, useEffect, useState } from 'react';
import GameBoard from './GameBoard';
import { Socket } from 'socket.io-client';
import useTimer from '../hooks/useTimer';

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

      socket?.off('opponentReady');
      socket.on('opponentReady', () => {
        socket.emit('ready');
        socket.off('opponentReady');
      });
    }
  });
  const [timer, time] = useTimer(breakTime);

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
    timer.setTime(breakTime);

    socket?.off('startGame');
    socket?.off('gameOver');
    socket?.off('dismissGame');

    socket.on('startGame', (isFirstMove) => {
      timer.setTime(matchTime);
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
      timer.setTime(breakTime);
      setEndMessage((endMessage) => {
        return { ...endMessage, ...{ hidden: false } };
      });
    });

    socket.on('dismissGame', (message) => {
      timer.setTime(0);
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
      timer.pause();
    };
  }, [leaveGame, socket, matchTime, breakTime, timer]);

  useEffect(() => {
    socket?.off('opponentMove');
    socket.on('opponentMove', (pos) => {
      timer.resume();
      makeMove(pos);
    });

    return () => {
      socket.off('opponentMove');
    };
  }, [makeMove, socket, timer]);

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
        <div className="multiplayer-game-timer-container">
          <div className="multiplayer-game-timer" data-timer>
            {`0${Math.floor(time / 60)}:${Math.ceil(
              time - Math.floor(time / 60) * 60
            )}`}
          </div>
        </div>
      </div>
    </>
  );
}
