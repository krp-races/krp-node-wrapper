import { EventEmitter } from "events";
import { SocketWrapper } from "./SocketWrapper";
import { ClientOptions } from "../interfaces/ClientOptions";
import { ClientStatus } from "../enums/ClientStatus";
import { readStringLines } from "../utils/readStringLines";
import { writeStringLines } from "../utils/writeStringLines";
import { ClientEvents } from "../interfaces/ClientEvents";
import { timeout } from "../utils/timeout";
import { LivetimingReader } from "./LivetimingReader";
import { LiveTimingData } from "../interfaces/LiveTimingData";

const defaultData: LiveTimingData = {
  event: undefined,
};

export class LivetimingClient extends EventEmitter<ClientEvents> {
  private data: LiveTimingData = defaultData;
  private enabled: boolean = false;
  private status: ClientStatus = ClientStatus.NOT_CONNECTED;
  private readonly options: ClientOptions;
  private readonly socket: SocketWrapper;

  constructor(options: ClientOptions) {
    super();
    this.options = options;
    this.socket = new SocketWrapper(options);
    this.socket.on("message", this.handleMessage.bind(this));
    this.socket.on("error", (err: Error) => {
      this.disconnect();
      this.handleError(err);
    });

    this.on("connected", this.handleKeepAlive.bind(this));
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

    const promise = new Promise((resolve, reject) => {
      const listener = (msg: Buffer) => {
        const lines = readStringLines(msg);

        switch (lines[0]) {
          case "OK":
            if (lines[1] !== "krp") {
              reject(new Error("Wrong game"));
              this.setStatus(ClientStatus.NOT_CONNECTED);
              this.socket.removeListener("message", listener);
              break;
            }

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

    return Promise.race([promise, timeout(5000)]);
  }

  public disconnect() {
    if (this.status !== ClientStatus.CONNECTED) return;

    const data = writeStringLines(["DISCONNECT"]);
    this.socket.send(data);

    this.setStatus(ClientStatus.NOT_CONNECTED);
    this.emit("disconnected");
  }

  public async keepAlive() {
    if (this.status !== ClientStatus.CONNECTED) return;

    const data = writeStringLines(["KEEPALIVE"]);
    this.socket.send(data);

    const promise = new Promise((resolve) => {
      const listener = (msg: Buffer) => {
        const lines = readStringLines(msg);

        switch (lines[0]) {
          case "ALIVE":
            resolve(undefined);
            this.socket.removeListener("message", listener);
            break;
        }
      };

      this.socket.on("message", listener);
    });

    return Promise.race([promise, timeout(5000)]);
  }

  private start(trackPositions: 0 | 1, collisions: 0 | 1 | 2) {
    if (this.status !== ClientStatus.CONNECTED) return;

    const data = writeStringLines([
      "START",
      trackPositions.toFixed(0),
      collisions.toFixed(0),
    ]);

    this.socket.send(data);
  }

  private acknowledge(messageId: string) {
    if (this.status !== ClientStatus.CONNECTED) return;
    const data = writeStringLines(["ACK", messageId]);
    this.socket.send(data);
  }

  private async handleReconnect() {
    // If not enabled, do not attempt to reconnect
    if (!this.enabled) return;

    await this.connect().catch((err) => this.handleError(err));

    // When connected to a server, do not attempt to reconnect
    if (this.status === ClientStatus.CONNECTED) {
      this.emit("connected");
      this.start(this.options.trackPositions, this.options.collisions);
      return;
    }

    // Attempt to reconnect in x milliseconds
    setTimeout(this.handleReconnect.bind(this), 5000);
  }

  private async handleKeepAlive() {
    if (this.status !== ClientStatus.CONNECTED) return;

    await this.keepAlive().catch((err) => this.handleError(err));

    setTimeout(this.handleKeepAlive.bind(this), 15000);
  }

  private handleMessage(msg: Buffer) {
    if (this.status !== ClientStatus.CONNECTED) return;
    const lines = readStringLines(msg);

    switch (lines[0]) {
      case "MSG":
        {
          const reader = new LivetimingReader(lines, this.data);
          this.data = reader.read();
          this.acknowledge(lines[1]);
          console.log(this.data);
        }
        break;
      case "DATA":
        {
          const reader = new LivetimingReader(lines, this.data, 1);
          this.data = reader.read();
          console.log(this.data);
        }
        break;
    }
  }

  private handleError(err: Error) {
    this.emit("error", err);
  }
}