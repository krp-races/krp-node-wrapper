import { Event } from "./Event/Event";
import { ChallengeEvent } from "./Event/ChallengeEvent";
import { Entry } from "./Entry/Entry";

export interface LiveTimingData {
  event?: Event | ChallengeEvent;
  entries: Map<number, Entry>;
}
