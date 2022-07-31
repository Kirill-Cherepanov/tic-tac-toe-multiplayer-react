import React, { useState, useEffect } from 'react';
import capitalize from '../utilities/capitalize';
import { io, Socket } from 'socket.io-client';
import MultiplayerMenu from './MultiplayerMenu';
import useLocalStorage from '../hooks/useLocalStorage';

type Props = { setGameMode: React.Dispatch<React.SetStateAction<string>> };

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
  const [isInSearch, setIsInSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setSocket(
      io(LOCAL_BACKEND) as Socket<ServerToClientEvents, ClientToServerEvents>
    );
  }, []);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (username === '') return;

    socket?.emit('enter', username);

    socket?.on('enterFailure', (message) => {
      setErrorMessage(message);
    });

    socket?.on('enterSuccess', () => {
      setIsInSearch(true);
      setErrorMessage('');
    });
  }, [socket, username]);

  if (isInSearch) {
    return (
      <MultiplayerMenu
        goBack={() => setIsInSearch(false)}
        username={username}
        socket={socket!}
      />
    );
  }

  return (
    <>
      <div className="multiplayer-menu">
        <div className="username-form-container">
          <form
            id="username-form"
            onSubmit={(e) => {
              e.preventDefault();

              setUsername(
                (e.currentTarget.elements as UsernameFormElements).username
                  .value
              );
            }}
          >
            <label htmlFor="username" className="username-label">
              Enter your user name
            </label>
            <input type="text" name="username" id="username" />
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
