import { SocketType } from "dgram";

export interface SocketOptions {
  type: SocketType;
  host: string;
  port: number;
}
