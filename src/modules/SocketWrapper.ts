import { createSocket, Socket } from "dgram";
import { EventEmitter } from "events";
import { SocketOptions } from "../interfaces/SocketOptions";
import { SocketEvents } from "../interfaces/SocketEvents";

export class SocketWrapper extends EventEmitter<SocketEvents> {
  private options: SocketOptions;
  private readonly socket: Socket;

  constructor(options: SocketOptions) {
    super();
    this.options = options;
    this.socket = createSocket(options.type);

    // Forward events
    this.socket.on("close", () => this.emit("close"));
    this.socket.on("connect", () => this.emit("connect"));
    this.socket.on("error", (err) => this.emit("error", err));
    this.socket.on("listening", () => this.emit("listening"));
    this.socket.on("message", (...args) => this.emit("message", ...args));
  }

  public send(msg: Buffer) {
    this.socket.send(msg, this.options.port, this.options.host);
  }
}
