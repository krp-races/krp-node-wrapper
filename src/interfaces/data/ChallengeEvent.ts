import { ChallengeType } from "../../enums/data/ChallengeType";
import { NormalEvent } from "./NormalEvent";

export interface ChallengeEvent extends NormalEvent {
  challengeType: ChallengeType;
  challengeLength: number;
  challengeMaxTries: number;
}
