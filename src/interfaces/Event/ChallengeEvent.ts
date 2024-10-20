import { ChallengeType } from "../../enums/Event/ChallengeType";
import { ChallengePracticeData } from "./ChallengePracticeData";
import { ChallengeRaceData } from "./ChallengeRaceData";
import { Event } from "./Event";

export interface ChallengeEvent extends Event {
  challengeType: ChallengeType;
  challengeLength: number;
  challengeMaxTries: number;
  challengeData: Map<string, ChallengeRaceData | ChallengePracticeData>;
}
