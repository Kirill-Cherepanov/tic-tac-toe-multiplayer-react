import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const DEPLOY_BACKEND = 'https://lit-citadel-75107.herokuapp.com/';
const LOCAL_BACKEND = 'http://localhost:8080';

const socket = io(LOCAL_BACKEND) as Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

function App() {
  useEffect(() => {
    socket.on('test', () => console.log('client test passed'));

    return () => {
      socket.off('test');
    };
  }, []);

  return (
    <div className="App">
      <button onClick={() => socket.emit('test')}>TEST</button>
    </div>
  );
}

export default App;
