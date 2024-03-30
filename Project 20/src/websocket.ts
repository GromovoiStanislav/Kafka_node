import WebSocket from 'ws';

export class WebsocketHandler extends WebSocket.Server {
  // constructor(options) {
  //   super(options);
  // }

  broadcast(data: Object) {
    this.clients.forEach((client) => {
      client.send(JSON.stringify(data));
    });
  }
}
