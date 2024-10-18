import { KartStatus } from "../../../enums/Session/Classification/KartStatus";
import { ClassificationEntry } from "./ClassificationEntry";

export interface TimeData extends ClassificationEntry {
  lapTime: number;
  lapNumber: number;
  totalLaps: number;
  gap: number | "--";
  speed: number;
  status: KartStatus;
}
