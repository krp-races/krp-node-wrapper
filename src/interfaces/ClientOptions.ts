import { SocketOptions } from "./SocketOptions";

export interface ClientOptions extends SocketOptions {
  password: string;
  trackPositions: 0 | 1;
  collisions: 0 | 1 | 2;
}
