import { Event } from "./Event/Event";
import { ChallengeEvent } from "./Event/ChallengeEvent";
import { Entry } from "./Entry/Entry";
import { Session } from "./Session/Session";
import { Contact } from "./Contact/Contact";
import { TrackData } from "./TrackData/TrackData";

export interface LiveTimingData {
  event?: Event | ChallengeEvent;
  entries: Map<number, Entry>;
  sessions: Map<string, Session>;
  contacts: Contact[];
  trackData?: TrackData;
}
