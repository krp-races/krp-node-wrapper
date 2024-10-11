import { EventEmitter } from "events";
import { SocketWrapper } from "./SocketWrapper";
import { ClientOptions } from "../interfaces/ClientOptions";
import { ClientStatus } from "../enums/ClientStatus";
import { readStringLines } from "../utils/readStringLines";
import { writeStringLines } from "../utils/writeStringLines";
import { ClientEvents } from "../interfaces/ClientEvents";

export class LivetimingClient extends EventEmitter<ClientEvents> {
  private enabled: boolean = false;
  private status: ClientStatus = ClientStatus.NOT_CONNECTED;
  private readonly options: ClientOptions;
  private readonly socket: SocketWrapper;

  constructor(options: ClientOptions) {
    super();
    this.options = options;
    this.socket = new SocketWrapper(options);
    this.socket.on("message", this.handleMessage.bind(this));
    this.socket.on("error", this.handleError.bind(this));
  }

  public setEnabled(enabled: boolean) {
    const prevEnabled = this.enabled;
    this.enabled = enabled;
    if (!prevEnabled && enabled) this.handleReconnect();
    if (prevEnabled && !enabled) this.disconnect();
  }

  public getEnabled() {
    return this.enabled;
  }

  private setStatus(status: ClientStatus) {
    this.status = status;
  }

  public getStatus() {
    return this.status;
  }

  public async connect() {
    if (this.status === ClientStatus.CONNECTED) return;
    this.setStatus(ClientStatus.CONNECTING);

    const data = writeStringLines(["CONNECT", this.options.password]);
    this.socket.send(data);

    return new Promise((resolve, reject) => {
      const listener = (msg: Buffer) => {
        const lines = readStringLines(msg);

        switch (lines[0]) {
          case "OK":
            resolve(undefined);
            this.setStatus(ClientStatus.CONNECTED);
            this.socket.removeListener("message", listener);
            break;
          case "FULL":
            reject(new Error("Server is full"));
            this.setStatus(ClientStatus.NOT_CONNECTED);
            this.socket.removeListener("message", listener);
            break;
          case "WRONGPASSWORD":
            reject(new Error("Wrong password"));
            this.setStatus(ClientStatus.NOT_CONNECTED);
            this.socket.removeListener("message", listener);
            break;
        }
      };

      this.socket.on("message", listener);
    });
  }

  public disconnect() {
    if (this.status !== ClientStatus.CONNECTED) return;

    const data = writeStringLines(["DISCONNECT"]);
    this.socket.send(data);

    this.setStatus(ClientStatus.NOT_CONNECTED);
  }

  private async handleReconnect() {
    // If not enabled, do not attempt to reconnect
    if (!this.enabled) return;

    await this.connect().catch((err) => this.handleError(err));

    // When connected to a server, do not attempt to reconnect
    if (this.status === ClientStatus.CONNECTED) {
      this.emit("connected");
      return;
    }

    // Attempt to reconnect in x milliseconds
    setTimeout(
      this.handleReconnect.bind(this),
      this.options.intervals.ReconnectInterval,
    );
  }

  private handleMessage(msg: Buffer) {
    if (this.status !== ClientStatus.CONNECTED) return;
    const lines = readStringLines(msg);
    console.log(lines);
  }

  private handleError(err: Error) {
    this.emit("error", err);
  }
}
