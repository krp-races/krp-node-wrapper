import { Event } from "./Event/Event";
import { ChallengeEvent } from "./Event/ChallengeEvent";
import { Entry } from "./Entry/Entry";
import { SessionType } from "../enums/Session/SessionType";
import { Session } from "./Session/Session";
import { Contact } from "./Contact/Contact";
import { TrackData } from "./TrackData/TrackData";

export interface LiveTimingData {
  event?: Event | ChallengeEvent;
  entries: Map<number, Entry>;
  sessions: Map<SessionType, Session>;
  contacts: Contact[];
  trackData?: TrackData;
}
