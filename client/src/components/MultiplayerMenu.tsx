import React, { useEffect, useState } from 'react';
import SearchSettings from './SearchSettings';
import { Socket } from 'socket.io-client';
import useLocalStorage from '../hooks/useLocalStorage';

type Props = {
  goBack: () => void;
  username: string;
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

export default function MultiplayerMenu({ goBack, username, socket }: Props) {
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
    socket.on('searchUpdate', (sessionsData) => {
      console.log('update search');
      setSessions(sessionsData);

      // It was in the original code, but I deemed it reduntant
      // Need to test if it works without this
      // setSessions((prevSessions) => {
      //   const newSessions;
      //   Object.keys(sessionsData).map((socketID) => {
      //     const prevSession = prevSessions[socketID];

      //     return {
      //       ...sessionsData[socketID],
      //       ...{
      //         wasInvited: prevSession?.wasInvited || false,
      //         invited: prevSession?.invited || false
      //       }
      //     };
      //   });

      // });
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
        <div className="pending-invites">
          {Object.keys(sessions)
            .filter(
              (socketID) =>
                sessions[socketID].wasInvited || sessions[socketID].invited
            )
            .map((socketID) => {
              const session = sessions[socketID];

              return (
                <div
                  className={
                    'multiplayer-session ' + session.wasInvited
                      ? 'active'
                      : 'pending'
                  }
                >
                  <span className="multiplayer-nickname">
                    {session.username}
                  </span>
                  <i
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
                  <i
                    className="accept-icon session-icon"
                    onClick={() => {
                      socket.emit('acceptInvite', socketID);
                    }}
                  ></i>
                </div>
              );
            })}
        </div>

        <div className="players-online">
          {Object.keys(sessions)
            .filter(
              (socketID) =>
                !sessions[socketID].wasInvited && !sessions[socketID].invited
            )
            .map((socketID) => {
              const session = sessions[socketID];

              return (
                <div className="multiplayer-session ">
                  <span className="multiplayer-nickname">
                    {session.username}
                  </span>
                  <i
                    className="accept-icon session-icon"
                    onClick={() => {
                      socket.emit('invite', socketID);

                      // Updating here and not on searchUpdate to eliminate delay
                      setSessions((sessions) => {
                        const session = sessions[socketID];
                        return {
                          ...sessions,
                          ...{
                            [socketID]: {
                              username: session.username,
                              wasInvited: true,
                              invited: false
                            }
                          }
                        };
                      });
                    }}
                  ></i>
                </div>
              );
            })}
        </div>
      </div>

      <div className="multiplayer-options">
        <button className="options-btn" id="leave-btn" onClick={goBack}>
          <i className="options-icon"></i>
          <label className="options-label">Leave</label>
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
