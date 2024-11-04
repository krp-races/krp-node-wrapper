import { ClientOptions } from "./ClientOptions";

export interface LiveTimingClientOptions extends ClientOptions {
  trackPositions: 0 | 1;
  collisions: 0 | 1 | 2;
}
