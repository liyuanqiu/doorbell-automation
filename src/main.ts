import { Socket, createServer } from "net";
import { createServer as createServerHTTP } from "http";
import { readFile } from "fs";
import { join } from "path";
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
      // ignore other regular status report
      // log(LogLevel.INFO, `TCP_SERVER Recv "${buf.toString("hex")}"`);
      if (buf.equals(REG_MSG)) {
        socket = _socket;
        log(LogLevel.INFO, `TCP_SERVER Recv "${buf.toString("hex")}"`);
        log(LogLevel.INFO, "TCP_SERVER Controller register successfully!");
        return;
      }
    });
    _socket.on("error", (e) => {
      log(LogLevel.WARN, `${e.name}: ${e.message}`);
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
    log(LogLevel.INFO, `HTTP_SERVER ${req.method} ${req.url}`);
    if (req.url === "/favicon.ico") {
      res.end("OK");
      return;
    }
    if (req.method === "GET" && req.url === "/") {
      log(LogLevel.INFO, "HTTP_SERVER Render index.html");
      res.setHeader("content-type", "text/html");
      readFile(join(__dirname, "index.html"), (err, buf) => {
        if (err) {
          res.end("500");
          return;
        }
        res.end(buf.toString("utf8"));
        return;
      });
      return;
    }
    if (socket === null) {
      log(LogLevel.INFO, "HTTP_SERVER No controller connected!");
      res.end("No controller connected!");
      return;
    }
    if (req.method === "GET") {
      switch (req.url) {
        case "/open-door": {
          log(LogLevel.INFO, "HTTP_SERVER Handling open-door...");
          try {
            socket.write(OPEN_DOOR_STEP_1_MSG, () => {
              setTimeout(() => {
                socket.write(OPEN_DOOR_STEP_2_MSG, () => {
                  res.end("OK");
                });
              }, 200);
            });
          } catch (e) {
            res.end(e.message);
          }
          break;
        }
        case "/open-door-step-1": {
          log(LogLevel.INFO, "HTTP_SERVER Handling open-door-step-1...");
          try {
            socket.write(OPEN_DOOR_STEP_1_MSG, () => {
              res.end("OK");
            });
          } catch (e) {
            res.end(e.message);
          }
          break;
        }
        case "/open-door-step-2": {
          log(LogLevel.INFO, "HTTP_SERVER Handling open-door-step-2...");
          try {
            socket.write(OPEN_DOOR_STEP_2_MSG, () => {
              res.end("OK");
            });
          } catch (e) {
            res.end(e.message);
          }
          break;
        }
        default:
          res.end("Unrecognized command.");
      }
    } else {
      res.end("Unsupported HTTP method.");
    }
  });

  server.listen(HTTP_PORT, () => {
    log(LogLevel.INFO, `HTTP_SERVER Listen on port [${HTTP_PORT}]`);
  });
}

createTCPServer();
createHTTPServer();
