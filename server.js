import { createServer } from "http";
import { WebSocketServer } from "ws";

const server = createServer((request, response) => {
  response.writeHead(404);
  response.end();
});
const wss = new WebSocketServer({ server });

const clients = new Map(); // Map to store WebSocket connections with unique identifiers
let reactClientId = null;

wss.on("connection", (ws, req) => {

  console.log("New client connected!");

  const id = crypto.randomUUID();
  
  clients.set(ws, id);

  //send welcome message
  ws.send("Hello on connection in server.js");

  // This is coming from the client websocket
  ws.on("message", (message) => {
    try {
      if (message.toString() === "reactClient") {
        reactClientId = id;
        console.log(`reactClientId is ${id}`);
      } else {
        console.log(`${message}`);
        if (reactClientId !== null) {
          const reactClient = Array.from(clients).find(
            ([ws, id]) => id === reactClientId
          );
          if (reactClient) {
            reactClient[0].send(message);
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error.message);
    }
  });

  ws.on("exit", (code, signal) => {
    ws.close();
  });

});

server.listen(10000, () => {
  console.log("Server is listening on port 10000");
});