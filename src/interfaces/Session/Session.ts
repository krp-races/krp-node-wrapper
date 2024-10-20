import { SessionState } from "../../enums/Session/SessionState";
import { SessionType } from "../../enums/Session/SessionType";
import { Classification } from "./Classification/Classification";
import { SessionEntry } from "./SessionEntry/SessionEntry";
import { Weather } from "./Weather";

export interface Session {
  type: SessionType;
  count?: number;
  state: SessionState;
  length: number;
  weather?: Weather;
  entries: Map<number, SessionEntry>;
  classification?: Classification;
}
