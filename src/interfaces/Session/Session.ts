import { SessionState } from "../../enums/Session/SessionState";
import { SessionType } from "../../enums/Session/SessionType";

export interface Session {
  type: SessionType;
  state: SessionState;
  length: number;
}
