import { SessionState } from "../../../enums/Session/SessionState";
import { RaceData } from "./RaceData";
import { TimeData } from "./TimeData";

export interface Classification {
  type: string;
  state: SessionState;
  timer: number;
  length: number;
  lap: number;
  laps: number;
  entries: Map<number, TimeData | RaceData>;
}
