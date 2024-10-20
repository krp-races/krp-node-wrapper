import { Kart } from "./Kart";

export interface ChallengeRaceData {
  name: string;
  kart: Kart;
  guid: string;
  extra: string;
  try: number;
}
