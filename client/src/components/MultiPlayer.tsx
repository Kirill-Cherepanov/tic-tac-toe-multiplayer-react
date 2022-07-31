import React, { useCallback, useEffect, useState, useRef } from 'react';
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
  const [time, setTime] = useState(breakTime);
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

  const timer = useRef(
    (() => {
      const updateTime = (() => {
        let intervalID: undefined | NodeJS.Timer;

        return (newTime: number) => {
          if (intervalID) clearInterval(intervalID);
          if (newTime < 0) return;

          intervalID = setInterval(() => {
            setTime((time) => {
              if (newTime === Infinity) newTime = time;
              if (time <= 0) {
                clearInterval(intervalID);
                return time;
              }
              return time - 0.1;
            });
          }, 100);
          setTime(newTime);
        };
      })();

      return {
        setTime: updateTime,
        resume: () => updateTime(Infinity),
        pause: () => updateTime(-1)
      };
    })()
  );

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
    const timer_ = timer.current;
    timer_.setTime(breakTime);

    socket.on('startGame', (isFirstMove) => {
      timer_.setTime(matchTime);
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
      timer_.setTime(breakTime);
      setEndMessage((endMessage) => {
        return { ...endMessage, ...{ hidden: false } };
      });
    });

    socket.on('dismissGame', (message) => {
      timer_.pause();
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
      timer_.pause();
    };
  }, [leaveGame, socket, matchTime, breakTime]);

  useEffect(() => {
    socket.on('opponentMove', (pos) => {
      timer.current.resume();
      makeMove(pos);
    });

    return () => {
      socket.off('opponentMove');
    };
  }, [makeMove, socket]);

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
            {Math.ceil(time)}
          </div>
        </div>
      </div>
    </>
  );
}
