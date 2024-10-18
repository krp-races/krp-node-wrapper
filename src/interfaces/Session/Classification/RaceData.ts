import { KartStatus } from "../../../enums/Session/Classification/KartStatus";
import { RaceStatus } from "../../../enums/Session/Classification/RaceStatus";
import { ClassificationEntry } from "./ClassificationEntry";

export interface RaceData extends ClassificationEntry {
  raceTime: number | RaceStatus;
  lapNumber: number;
  gap: number | "L";
  status: KartStatus;
}
