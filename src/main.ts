import { Socket, createServer } from "net";
import { log, LogLevel } from "./log";
import { TCP_PORT } from "./constant";

let socket: Socket | null = null;

function createTCPServer() {
  const server = createServer((_socket) => {
    socket = _socket;
    log(LogLevel.INFO, "Client connected!");
    log(LogLevel.INFO, `Client address: ${JSON.stringify(socket.address())}`);
    socket.on("end", () => {
      log(LogLevel.INFO, "Client disconnected!");
    });
  });

  server.on("error", (err) => {
    throw err;
  });

  server.listen(TCP_PORT, () => {
    log(LogLevel.INFO, `Listen on port [${TCP_PORT}]`);
  });
}
