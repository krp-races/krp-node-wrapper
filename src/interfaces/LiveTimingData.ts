import { Event } from "./Event/Event";
import { ChallengeEvent } from "./Event/ChallengeEvent";

export interface LiveTimingData {
  event?: Event | ChallengeEvent;
}
