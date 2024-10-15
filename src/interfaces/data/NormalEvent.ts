import { EventType } from "../../enums/data/EventType";

export interface NormalEvent {
  type: EventType;
  name: string;
  track: string;
  trackLength: number;
  allowed: string[];
}
