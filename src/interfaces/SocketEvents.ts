import { RemoteInfo } from "dgram";

export interface SocketEvents {
  close: [];
  connect: [];
  error: [err: Error];
  listening: [];
  message: [msg: Buffer, rinfo: RemoteInfo];
}
