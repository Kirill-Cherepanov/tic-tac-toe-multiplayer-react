import React, { useState, useEffect } from 'react';
import capitalize from '../utilities/capitalize';
import { io, Socket } from 'socket.io-client';
import MultiplayerMenu from './MultiplayerMenu';
import useLocalStorage from '../hooks/useLocalStorage';
import MultiPlayer from './MultiPlayer';

type Props = { setGameMode: React.Dispatch<React.SetStateAction<string>> };

type MultiPlayerProps = {
  breakTime: number;
  matchTime: number;
  opponent: string;
  leaveGame: () => void;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
};

interface UsernameFormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
}

// const HEROKU_BACKEND = 'https://lit-citadel-75107.herokuapp.com/';
const LOCAL_BACKEND = 'http://localhost:8080';

export default function EnterMultiplayer({ setGameMode }: Props) {
  const [socket, setSocket] = useState<
    undefined | Socket<ServerToClientEvents, ClientToServerEvents>
  >();
  const [username, setUsername] = useLocalStorage('usename', '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isInSearch, setIsInSearch] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [multiplayerProps, setMultiplayerProps] =
    useState<MultiPlayerProps | null>(null);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    setSocket(
      io(LOCAL_BACKEND) as Socket<ServerToClientEvents, ClientToServerEvents>
    );
  }, []);

  useEffect(() => {
    socket?.off('enterFailure');
    socket?.off('enterSuccess');

    socket?.on('enterFailure', (message) => {
      setErrorMessage(message);
    });

    socket?.on('enterSuccess', () => {
      setIsInSearch(true);
      setErrorMessage('');
    });

    return () => {
      socket?.off('enterFailure');
      socket?.off('enterSuccess');
    };
  }, [socket]);

  useEffect(() => {
    socket?.off('openRoom');

    socket?.on('openRoom', (breakTime, matchTime, opponent) => {
      setMultiplayerProps({
        breakTime,
        matchTime,
        opponent,
        leaveGame: () => {
          socket.emit('leaveGame');
          socket.emit('enter', username);
          setIsInGame(false);
        },
        socket
      });
      setIsInGame(true);
      setIsInSearch(false);
    });
  }, [socket, username]);

  if (isInSearch) {
    return (
      <MultiplayerMenu goBack={() => setIsInSearch(false)} socket={socket!} />
    );
  }

  if (isInGame) {
    return <MultiPlayer {...multiplayerProps!} />;
  }

  return (
    <>
      <div className="multiplayer-menu">
        <div className="username-form-container">
          <form
            id="username-form"
            onSubmit={(e) => {
              e.preventDefault();

              if (username === '') return;

              socket?.emit('enter', username);

              setUsername(
                (e.currentTarget.elements as UsernameFormElements).username
                  .value
              );
            }}
          >
            <label htmlFor="username" className="username-label">
              Enter your user name
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onInput={(e) => setUsername(e.currentTarget.value)}
            />
            <button type="submit" id="submit-username">
              Submit
            </button>
          </form>
          {!errorMessage ? null : (
            <div className="connection-error">{errorMessage}</div>
          )}
        </div>
      </div>

      <div className="game-mode">
        {['single', 'multi', 'ai'].map((mode) => {
          return (
            <button
              id={`${mode}-button`}
              className={'game-mode-btn' + (mode === 'multi' ? ' active' : '')}
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
