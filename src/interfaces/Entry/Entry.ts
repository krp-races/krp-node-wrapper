import { EntryKart } from "./EntryKart";

export interface Entry {
  raceNumber: number;
  name: string;
  kart: EntryKart;
  guid: string;
  extra: string;
  online: boolean;
}
