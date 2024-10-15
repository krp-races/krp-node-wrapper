import { ChallengeEvent } from "./ChallengeEvent";
import { NormalEvent } from "./NormalEvent";

export interface LiveTiming {
  event?: ChallengeEvent | NormalEvent;
}
