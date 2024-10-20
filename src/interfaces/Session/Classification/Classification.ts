import { SessionState } from "../../../enums/Session/SessionState";
import { SessionType } from "../../../enums/Session/SessionType";
import { RaceData } from "./RaceData";
import { TimeData } from "./TimeData";

export interface Classification {
  type: SessionType;
  count?: number;
  state: SessionState;
  timer: number;
  length: number;
  lap: number;
  laps: number;
  entries: Map<number, TimeData | RaceData>;
}
