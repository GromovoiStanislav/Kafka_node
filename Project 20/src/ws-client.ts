import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000');

ws.on('message', function message(data) {
  console.log('received: %s', data);
});
