import { Vec2 } from "../../Vec2";

export interface Lap {
  raceNumber: number;
  sessionTime: number;
  lapTime: number;
  lapNumber: number;
  splits: Vec2;
  speed: number;
  invalid: boolean;
}
