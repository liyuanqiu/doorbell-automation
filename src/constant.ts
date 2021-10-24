import { env } from "process";

export const TCP_PORT = 8899;
export const HTTP_PORT = env.NODE_ENV === "development" ? 8080 : 80;
export const REG_MSG = Buffer.from("64af0fb67164", "hex");
export const OPEN_DOOR_STEP_1_MSG = Buffer.from("55AA000300020106", "hex");
export const OPEN_DOOR_STEP_2_MSG = Buffer.from("55AA000300010106", "hex");
