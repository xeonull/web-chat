import { WebSocketServer } from "ws";

const PORT = 5000;

const wss = new WebSocketServer({ port: PORT }, () => console.log(`WebSocket Server started on port ${PORT}`));

wss.on("connection", (socet) => {
  socet.on("message", (message) => {
    message = JSON.parse(message);
    switch (message.event) {
      case "message":
        console.log(`${message.user} says: '${message.text}'`);
        broadcastMessage(message);
        break;
      case "connection":
        console.log(`${message.user} user connected`);
        broadcastMessage(message);
        break;
    }
  });
});

function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
}
