import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const socket = io('https://lit-citadel-75107.herokuapp.com/') as Socket<
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
