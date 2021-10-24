import { createConnection } from "net";
import { log, LogLevel } from "./log";
import { TCP_PORT } from "./constant";

const client = createConnection({ port: TCP_PORT }, () => {
  log(LogLevel.INFO, "Connected to server!");
  log(LogLevel.INFO, `Local address: ${client.localAddress}`);
  log(LogLevel.INFO, `Local port: ${client.localPort}`);
  client.write("Hello!");
});
client.on("data", (data) => {
  log(LogLevel.INFO, `Recv data: ${data.toString()}`);
  client.end();
});
client.on("end", () => {
  log(LogLevel.INFO, "Disconnected!");
});
