import { ClientIntervals } from "./ClientIntervals";
import { SocketOptions } from "./SocketOptions";

export interface ClientOptions extends SocketOptions {
  password: string;
  intervals: ClientIntervals;
}
