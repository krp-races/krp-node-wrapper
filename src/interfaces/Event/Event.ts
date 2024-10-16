import { EventType } from "../../enums/Event/EventType";
import { Track } from "./Track";

export interface Event {
  type: EventType;
  name: string;
  track: Track;
  allowed: string[];
}
