import { EventEmitter } from "events";
import { ClientEvents } from "../interfaces/ClientEvents";
import { ClientStatus } from "../enums/ClientStatus";
import { ClientOptions } from "../interfaces/ClientOptions";
import { SocketWrapper } from "./SocketWrapper";
import { writeStringLines } from "../utils/writeStringLines";
import { readStringLines } from "../utils/readStringLines";
import { timeout } from "../utils/timeout";

export class RemoteAdminClient extends EventEmitter<ClientEvents> {
  private enabled: boolean = false;
  private status: ClientStatus = ClientStatus.NOT_CONNECTED;
  private messageId: number = 0;
  private readonly options: ClientOptions;
  private readonly socket: SocketWrapper;

  constructor(options: ClientOptions) {
    super();
    this.options = options;
    this.socket = new SocketWrapper(options);
    this.socket.on("error", this.handleError.bind(this));
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
    this.messageId = 0;
  }

  public getStatus() {
    return this.status;
  }

  private async connect() {
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

    return Promise.race([promise, timeout(5000)]).catch((err) =>
      this.handleError(err),
    );
  }

  private disconnect() {
    if (this.status !== ClientStatus.CONNECTED) return;

    const data = writeStringLines(["DISCONNECT"]);
    this.socket.send(data);

    this.setStatus(ClientStatus.NOT_CONNECTED);
    this.emit("disconnected");
  }

  public async sendCommand(command: "QUIT" | "MSG", message?: string) {
    if (this.status !== ClientStatus.CONNECTED) return;

    const messageId = this.messageId;
    const base = ["CMD", messageId.toFixed(0), command];
    if (command === "MSG") {
      if (!message || message === "")
        throw new Error("Message is required for MSG command");
      base.push(message);
    }

    const data = writeStringLines(base);
    this.socket.send(data);

    // Increase message id for next command
    this.messageId++;

    const promise = new Promise((resolve) => {
      const listener = (msg: Buffer) => {
        const lines = readStringLines(msg);

        if (lines[0] === "ACK" && parseInt(lines[1]) === messageId) {
          resolve(undefined);
          this.socket.removeListener("message", listener);
        }
      };

      this.socket.on("message", listener);
    });

    return Promise.race([promise, timeout(5000)]).catch((err) =>
      this.handleError(err),
    );
  }

  private async keepAlive() {
    if (this.status !== ClientStatus.CONNECTED) return;

    const data = writeStringLines(["KEEPALIVE"]);
    this.socket.send(data);

    const promise = new Promise((resolve) => {
      const listener = (msg: Buffer) => {
        const lines = readStringLines(msg);
        if (lines[0] === "ALIVE") {
          resolve(undefined);
          this.socket.removeListener("message", listener);
        }
      };

      this.socket.on("message", listener);
    });

    return Promise.race([promise, timeout(5000)]).catch((err) =>
      this.handleError(err),
    );
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
    setTimeout(this.handleReconnect.bind(this), 5000);
  }

  private async handleKeepAlive() {
    if (this.status !== ClientStatus.CONNECTED) return;

    await this.keepAlive().catch((err) => this.handleError(err));

    setTimeout(this.handleKeepAlive.bind(this), 15000);
  }

  private handleError(err: Error) {
    this.emit("error", err);
    this.disconnect();
  }
}
