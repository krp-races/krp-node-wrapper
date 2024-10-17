import { PenaltyOffence } from "../../../enums/Session/SessionEntry/PenaltyOffence";
import { PenaltyType } from "../../../enums/Session/SessionEntry/PenaltyType";

export interface Penalty {
  raceNumber: number;
  penaltyNumber: number;
  type: PenaltyType;
  penalty: number;
  offence: PenaltyOffence;
}
