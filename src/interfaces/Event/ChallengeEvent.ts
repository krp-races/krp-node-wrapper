import { ChallengeType } from "../../enums/Event/ChallengeType";
import { Event } from "./Event";

export interface ChallengeEvent extends Event {
  challengeType: ChallengeType;
  challengeLength: number;
  challengeMaxTries: number;
}
