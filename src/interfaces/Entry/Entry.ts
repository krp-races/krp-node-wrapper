import { Kart } from "./Kart";

export interface Entry {
  raceNumber: number;
  name: string;
  kart: Kart;
  guid: string;
  extra: string;
  online: boolean;
}
