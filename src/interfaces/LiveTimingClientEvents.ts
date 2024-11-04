import { ClientEvents } from "./ClientEvents";
import { LiveTimingData } from "./LiveTimingData";

export interface LiveTimingClientEvents extends ClientEvents {
  data: [data: LiveTimingData];
}
