import { ChallengeRaceData } from "./ChallengeRaceData";

export interface ChallengePracticeData extends ChallengeRaceData {
  bestLap: number;
  lapNumber: number;
  totalLaps: number;
}
