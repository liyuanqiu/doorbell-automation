import { Socket, createServer } from "net";
import { createServer as createServerHTTP } from "http";
import { log, LogLevel } from "./log";
import {
  TCP_PORT,
  HTTP_PORT,
  REG_MSG,
  OPEN_DOOR_STEP_1_MSG,
  OPEN_DOOR_STEP_2_MSG,
} from "./constant";

let socket: Socket | null = null;

function createTCPServer() {
  const server = createServer((_socket) => {
    log(LogLevel.INFO, "TCP_SERVER Client connected!");
    log(
      LogLevel.INFO,
      `TCP_SERVER Client address: ${JSON.stringify(_socket.address())}`
    );
    _socket.on("end", () => {
      log(LogLevel.INFO, "TCP_SERVER Client disconnected!");
    });
    _socket.on("data", (buf) => {
      log(LogLevel.INFO, `TCP_SERVER Recv "${buf.toString("hex")}"`);
      if (buf.equals(REG_MSG)) {
        socket = _socket;
        log(LogLevel.INFO, "TCP_SERVER Controller register successfully!");
        return;
      }
    });
  });

  server.on("error", (err) => {
    throw err;
  });

  server.listen(TCP_PORT, () => {
    log(LogLevel.INFO, `TCP_SERVER Listen on port [${TCP_PORT}]`);
  });
}

function createHTTPServer() {
  const server = createServerHTTP((req, res) => {
    log(LogLevel.INFO, `${req.method} ${req.url}`);
    if (req.method === "GET" && req.url === "/open-door") {
      log(LogLevel.INFO, "HTTP_SERVER Handling opening door...");
      if (socket === null) {
        log(LogLevel.INFO, "HTTP_SERVER No controller connected!");
        res.end("No controller connected!");
        return;
      }
      socket.write(OPEN_DOOR_STEP_1_MSG, () => {
        setTimeout(() => {
          socket.write(OPEN_DOOR_STEP_2_MSG, () => {
            res.end("Command sent to controller.");
          });
        }, 200);
      });
      return;
    }
    res.end("Unrecognized command.");
  });

  server.listen(HTTP_PORT, () => {
    log(LogLevel.INFO, `HTTP_SERVER Listen on port [${HTTP_PORT}]`);
  });
}

createTCPServer();
createHTTPServer();
