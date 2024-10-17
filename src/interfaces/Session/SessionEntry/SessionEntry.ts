import { DriverStatusReason } from "../../../enums/Session/SessionEntry/DriverStatusReason";
import { DriverStatusState } from "../../../enums/Session/SessionEntry/DriverStatusState";
import { Lap } from "./Lap";
import { Penalty } from "./Penalty";
import { Speed } from "./Speed";
import { Split } from "./Split";

export interface SessionEntry {
  raceNumber: number;
  state: DriverStatusState;
  reason: DriverStatusReason;
  bestLap?: Lap;
  lastLap?: Lap;
  laps: Lap[];
  penalties: Penalty[];
  splits: Split[];
  speeds: Speed[];
}
