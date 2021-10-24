import moment from "moment";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export function log(level: LogLevel, message: string) {
  console.log(
    `[${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}] ${level} ${message}`
  );
}
