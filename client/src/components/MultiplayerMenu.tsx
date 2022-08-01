import React, { useEffect, useState } from 'react';
import SearchSettings from './SearchSettings';
import { Socket } from 'socket.io-client';
import useLocalStorage from '../hooks/useLocalStorage';

type Props = {
  goBack: () => void;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
};

const DEFAULT_SEARCH_PARAMS = {
  matchTime: {
    value: 30,
    strict: false
  },
  breakTime: {
    value: 30,
    strict: false
  }
};

export default function MultiplayerMenu({ goBack, socket }: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionsData>({});
  const [searchParams, setSearchParams] = useLocalStorage<SearchParams>(
    'searchParams',
    DEFAULT_SEARCH_PARAMS
  );

  useEffect(() => {
    socket.emit('changeSearchParams', searchParams);
  }, [searchParams, socket]);

  useEffect(() => {
    socket?.off('searchUpdate');

    socket.on('searchUpdate', (sessionsData) => {
      setSessions(sessionsData);
    });

    return () => {
      socket.off('searchUpdate');
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      socket.emit('leaveSearch');
    };
  }, [socket]);

  if (isSettingsOpen) {
    return (
      <SearchSettings
        searchParamsState={[searchParams, setSearchParams]}
        goBack={() => setIsSettingsOpen(false)}
      />
    );
  }

  return (
    <>
      <div className="multiplayer-menu" data-multiplayer-menu>
        {getPendingInvites(sessions).length === 0 ? null : (
          <div className="pending-invites">
            {getPendingInvites(sessions).map((socketID) => {
              const session = sessions[socketID];

              return (
                <div
                  key={socketID}
                  className={
                    'multiplayer-session ' +
                    (session.wasInvited ? ' active' : ' pending')
                  }
                  tabIndex={1}
                >
                  <span className="multiplayer-nickname">
                    {session.username}
                  </span>
                  <i
                    tabIndex={2}
                    className="cancel-icon session-icon"
                    onClick={() => {
                      socket.emit('cancelInvite', socketID, session.wasInvited);

                      // Updating here and not on searchUpdate to eliminate delay
                      setSessions((sessions) => {
                        const session = sessions[socketID];
                        return {
                          ...sessions,
                          ...{
                            [socketID]: {
                              username: session.username,
                              wasInvited: false,
                              invited: false
                            }
                          }
                        };
                      });
                    }}
                  />
                  {session.invited ? null : (
                    <i
                      tabIndex={2}
                      className="accept-icon session-icon"
                      onClick={() => {
                        socket.emit('acceptInvite', socketID);
                      }}
                    ></i>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="players-online">
          {getNotPendingInvites(sessions).map((socketID) => {
            const session = sessions[socketID];

            const invite = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
              e.stopPropagation();
              socket.emit('invite', socketID);
              setSessions((sessions) => {
                return {
                  ...sessions,
                  ...{
                    [socketID]: {
                      username: sessions[socketID].username,
                      wasInvited: true,
                      invited: false
                    }
                  }
                };
              });
            };

            return (
              <div key={socketID} className="multiplayer-session" tabIndex={1}>
                <span className="multiplayer-nickname">{session.username}</span>
                <i
                  className="accept-icon session-icon"
                  onClick={invite}
                  tabIndex={2}
                ></i>
              </div>
            );
          })}
        </div>
      </div>

      <div className="multiplayer-options">
        <button className="options-btn" id="leave-btn" onClick={goBack}>
          <i className="options-icon"></i>
          <label className="options-label">Return</label>
        </button>
        <button
          className="options-btn"
          id="settings-btn"
          onClick={() => {
            setIsSettingsOpen(true);
          }}
        >
          <i className="options-icon"></i>
          <label className="options-label">Settings</label>
        </button>
      </div>
    </>
  );
}

const getPendingInvites = (sessions: SessionsData) => {
  return Object.keys(sessions).filter(
    (socketID) => sessions[socketID].wasInvited || sessions[socketID].invited
  );
};

const getNotPendingInvites = (sessions: SessionsData) => {
  return Object.keys(sessions).filter(
    (socketID) => !sessions[socketID].wasInvited && !sessions[socketID].invited
  );
};
