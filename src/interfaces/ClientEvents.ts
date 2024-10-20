import { LiveTimingData } from "./LiveTimingData";

export interface ClientEvents {
  connected: [];
  disconnected: [];
  data: [data: LiveTimingData];
  error: [err: Error];
}
