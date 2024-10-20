import { DataType } from "../enums/DataType";
import { ChallengeType } from "../enums/Event/ChallengeType";
import { EventType } from "../enums/Event/EventType";
import { KartStatus } from "../enums/Session/Classification/KartStatus";
import { RaceStatus } from "../enums/Session/Classification/RaceStatus";
import { DriverStatusReason } from "../enums/Session/SessionEntry/DriverStatusReason";
import { DriverStatusState } from "../enums/Session/SessionEntry/DriverStatusState";
import { PenaltyOffence } from "../enums/Session/SessionEntry/PenaltyOffence";
import { PenaltyType } from "../enums/Session/SessionEntry/PenaltyType";
import { SessionState } from "../enums/Session/SessionState";
import { SessionType } from "../enums/Session/SessionType";
import { WeatherCondition } from "../enums/Session/WeatherCondition";
import { TrackSegmentType } from "../enums/TrackData/TrackSegmentType";
import { ChallengeEvent } from "../interfaces/Event/ChallengeEvent";
import { ChallengePracticeData } from "../interfaces/Event/ChallengePracticeData";
import { ChallengeRaceData } from "../interfaces/Event/ChallengeRaceData";
import { LiveTimingData } from "../interfaces/LiveTimingData";
import { RaceData } from "../interfaces/Session/Classification/RaceData";
import { TimeData } from "../interfaces/Session/Classification/TimeData";
import { SessionEntry } from "../interfaces/Session/SessionEntry/SessionEntry";
import { TrackPosition } from "../interfaces/TrackData/TrackPosition";
import { TrackSegment } from "../interfaces/TrackData/TrackSegment";
import { Vec2 } from "../utils/Vec2";
import { Vec3 } from "../utils/Vec3";

export class LivetimingReader {
  private offset: number;
  private data: LiveTimingData;
  private readonly lines: string[];

  constructor(lines: string[], data: LiveTimingData, offset: number = 2) {
    this.lines = lines;
    this.data = data;
    this.offset = offset;
  }

  public read() {
    while (this.offset !== -1) {
      const type = this.lines[this.offset] as DataType;

      switch (type) {
        case DataType.EVENT:
          this.readEvent();
          break;
        case DataType.CHALLENGEDATA:
          this.readChallengeData();
          break;
        case DataType.ENTRY:
        case DataType.ENTRYREMOVE:
          this.readEntry();
          break;
        case DataType.SESSION:
        case DataType.SESSIONSTATUS:
        case DataType.WEATHER:
        case DataType.SESSIONENTRY:
        case DataType.DRIVERSTATUS:
        case DataType.BESTLAP:
        case DataType.LASTLAP:
        case DataType.PENALTY:
        case DataType.LAP:
        case DataType.SPLIT:
        case DataType.SPEED:
        case DataType.CLASSIFICATION:
          this.readSession();
          break;
        case DataType.CONTACT:
          this.readContact();
          break;
        case DataType.TRACKDATA:
        case DataType.TRACKSEGMENT:
        case DataType.TRACKPOSITION:
          this.readTrackData();
          break;
        default:
          break;
      }

      // Determine next offset
      this.offset = this.lines.findIndex(
        (line, index) =>
          index > this.offset &&
          Object.values(DataType).includes(line as DataType),
      );
    }

    return this.data;
  }

  private readEvent() {
    const type = this.lines[this.offset + 1] as EventType;

    switch (type) {
      case EventType.CHALLENGE:
        this.data.event = {
          type,
          name: this.lines[this.offset + 2],
          track: {
            name: this.lines[this.offset + 3],
            length: parseFloat(this.lines[this.offset + 4]),
          },
          allowed: this.lines[this.offset + 5].replace(" + ", "/").split("/"),
          challengeType: this.lines[this.offset + 6] as ChallengeType,
          challengeLength: parseFloat(this.lines[this.offset + 7]),
          challengeMaxTries: parseInt(this.lines[this.offset + 8]),
          challengeData: new Map<
            string,
            ChallengeRaceData | ChallengePracticeData
          >(),
        };
        break;
      default:
        this.data.event = {
          type,
          name: this.lines[this.offset + 2],
          track: {
            name: this.lines[this.offset + 3],
            length: parseFloat(this.lines[this.offset + 4]),
          },
          allowed: this.lines[this.offset + 5].replace(" + ", "/").split("/"),
        };
        break;
    }
  }

  private readChallengeData() {
    if (this.data.event?.type !== EventType.CHALLENGE) return;
    const event = this.data.event as ChallengeEvent;

    let data: ChallengeRaceData | ChallengePracticeData | undefined;
    switch (event.challengeType) {
      case ChallengeType.PRACTICE:
        data = {
          name: this.lines[this.offset + 1],
          kart: {
            name: this.lines[this.offset + 2],
            shortName: this.lines[this.offset + 3],
          },
          guid: this.lines[this.offset + 4],
          extra: this.lines[this.offset + 5],
          try: parseInt(this.lines[this.offset + 6]),
          bestLap: parseFloat(this.lines[this.offset + 7]),
          lapNumber: parseInt(this.lines[this.offset + 8]),
          totalLaps: parseInt(this.lines[this.offset + 9]),
        };
        break;
      case ChallengeType.RACE:
        data = {
          name: this.lines[this.offset + 1],
          kart: {
            name: this.lines[this.offset + 2],
            shortName: this.lines[this.offset + 3],
          },
          guid: this.lines[this.offset + 4],
          extra: this.lines[this.offset + 5],
          try: parseInt(this.lines[this.offset + 6]),
        };
        break;
    }

    if (!data) return;
    event.challengeData.set(data.guid, data);
    this.data.event = event;
  }

  private readEntry() {
    const type = this.lines[this.offset] as DataType;
    const raceNumber = parseInt(this.lines[this.offset + 1]);

    switch (type) {
      case DataType.ENTRY:
        {
          const entry = {
            raceNumber,
            name: this.lines[this.offset + 2],
            kart: {
              name: this.lines[this.offset + 3],
              shortName: this.lines[this.offset + 4],
              categories: this.lines[this.offset + 5].split("/"),
            },
            guid: this.lines[this.offset + 6],
            extra: this.lines[this.offset + 7],
            online: true,
          };

          this.data.entries.set(entry.raceNumber, entry);
        }
        break;
      case DataType.ENTRYREMOVE:
        {
          const currentEntry = this.data.entries.get(raceNumber);
          if (!currentEntry) break;
          currentEntry.online = false;
          this.data.entries.set(raceNumber, currentEntry);
        }
        break;
    }
  }

  private readSession() {
    const type = this.lines[this.offset] as DataType;

    switch (type) {
      case DataType.SESSION:
        {
          const sessionType = this.readSessionType(this.lines[this.offset + 1]);

          const session = {
            type: sessionType.type,
            count: sessionType.count,
            state: this.lines[this.offset + 2] as SessionState,
            length: parseFloat(this.lines[this.offset + 3]),
            entries: new Map<number, SessionEntry>(),
          };

          if (session.type === SessionType.WAITING) this.data.sessions.clear();
          this.data.sessions.set(sessionType.combined, session);
        }
        break;
      case DataType.SESSIONSTATUS:
        {
          const sessionType = this.readSessionType(this.lines[this.offset + 1]);
          const currentSession = this.data.sessions.get(sessionType.combined);
          if (!currentSession) break;
          currentSession.state = this.lines[this.offset + 2] as SessionState;
          this.data.sessions.set(sessionType.combined, currentSession);
        }
        break;
      case DataType.WEATHER:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const weather = {
            condition: this.lines[this.offset + 1] as WeatherCondition,
            air: parseFloat(this.lines[this.offset + 2]),
            track: parseFloat(this.lines[this.offset + 3]),
          };

          currentSession.weather = weather;
          this.data.sessions.set(sessionKey, currentSession);
        }
        break;
      case DataType.SESSIONENTRY:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);

          const entry = {
            raceNumber,
            state: DriverStatusState.NONE,
            reason: DriverStatusReason.NONE,
            laps: [],
            penalties: [],
            splits: [],
            speeds: [],
          };

          currentSession.entries.set(raceNumber, entry);
        }
        break;
      case DataType.DRIVERSTATUS:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);
          const state = this.lines[this.offset + 2] as DriverStatusState;
          const reason = this.lines[this.offset + 3] as DriverStatusReason;

          const currentEntry = currentSession.entries.get(raceNumber);
          if (!currentEntry) break;

          currentEntry.state = state;
          currentEntry.reason = reason;

          currentSession.entries.set(raceNumber, currentEntry);
        }
        break;
      case DataType.BESTLAP:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);
          const sessionTime = parseFloat(this.lines[this.offset + 2]);
          const lapTime = parseFloat(this.lines[this.offset + 3]);
          const lapNumber = parseInt(this.lines[this.offset + 4]);
          const splits = Vec2(
            parseFloat(this.lines[this.offset + 5]),
            parseFloat(this.lines[this.offset + 6]),
          );
          const speed = parseFloat(this.lines[this.offset + 7]);

          const currentEntry = currentSession.entries.get(raceNumber);
          if (!currentEntry) break;

          currentEntry.bestLap = {
            raceNumber,
            sessionTime,
            lapTime,
            lapNumber,
            splits,
            speed,
            invalid: false,
          };

          currentSession.entries.set(raceNumber, currentEntry);
        }
        break;
      case DataType.LASTLAP:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);
          const sessionTime = parseFloat(this.lines[this.offset + 2]);
          const lapTime = parseFloat(this.lines[this.offset + 3]);
          const lapNumber = parseInt(this.lines[this.offset + 4]);
          const splits = Vec2(
            parseFloat(this.lines[this.offset + 5]),
            parseFloat(this.lines[this.offset + 6]),
          );
          const speed = parseFloat(this.lines[this.offset + 7]);

          const currentEntry = currentSession.entries.get(raceNumber);
          if (!currentEntry) break;

          currentEntry.lastLap = {
            raceNumber,
            sessionTime,
            lapTime,
            lapNumber,
            splits,
            speed,
            invalid: false,
          };

          currentSession.entries.set(raceNumber, currentEntry);
        }
        break;
      case DataType.PENALTY:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);
          const penaltyNumber = parseInt(this.lines[this.offset + 2]);
          const type = this.lines[this.offset + 3] as PenaltyType;
          const penalty = parseFloat(this.lines[this.offset + 4]);
          const offence = this.lines[this.offset + 5] as PenaltyOffence;

          const currentEntry = currentSession.entries.get(raceNumber);
          if (!currentEntry) break;

          currentEntry.penalties.push({
            raceNumber,
            penaltyNumber,
            type,
            penalty,
            offence,
          });

          currentSession.entries.set(raceNumber, currentEntry);
        }
        break;
      case DataType.LAP:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);
          const invalid = parseInt(this.lines[this.offset + 2]) === 1;
          const sessionTime = parseFloat(this.lines[this.offset + 3]);
          const lapTime = parseFloat(this.lines[this.offset + 4]);
          const splits = Vec2(
            parseFloat(this.lines[this.offset + 5]),
            parseFloat(this.lines[this.offset + 6]),
          );
          const speed = parseFloat(this.lines[this.offset + 7]);

          const currentEntry = currentSession.entries.get(raceNumber);
          if (!currentEntry) break;

          currentEntry.laps.push({
            raceNumber,
            sessionTime,
            lapTime,
            splits,
            speed,
            invalid,
          });

          currentSession.entries.set(raceNumber, currentEntry);
        }
        break;
      case DataType.SPLIT:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);
          const splitNumber = parseInt(this.lines[this.offset + 2]);
          const splitTime = parseFloat(this.lines[this.offset + 2]);

          const currentEntry = currentSession.entries.get(raceNumber);
          if (!currentEntry) break;

          currentEntry.splits.push({
            raceNumber,
            splitNumber,
            splitTime,
          });

          currentSession.entries.set(raceNumber, currentEntry);
        }
        break;
      case DataType.SPEED:
        {
          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionKey);
          if (!currentSession) break;

          const raceNumber = parseInt(this.lines[this.offset + 1]);
          const speed = parseFloat(this.lines[this.offset + 2]);

          const currentEntry = currentSession.entries.get(raceNumber);
          if (!currentEntry) break;

          currentEntry.speeds.push({
            raceNumber,
            speed,
          });

          currentSession.entries.set(raceNumber, currentEntry);
        }
        break;
      case DataType.CLASSIFICATION:
        {
          const sessionType = this.readSessionType(this.lines[this.offset + 1]);
          const sessionState = this.lines[this.offset + 2] as SessionState;
          const sessionTimer = parseFloat(this.lines[this.offset + 3]);
          const sessionLength = parseFloat(this.lines[this.offset + 4]);
          const sessionLap = parseInt(this.lines[this.offset + 5]);
          const sessionLaps = parseInt(this.lines[this.offset + 6]);

          const sessionKey = this.getCurrentSessionKey();
          if (!sessionKey) break;
          const currentSession = this.data.sessions.get(sessionType.combined);
          if (!currentSession) break;

          const classification = {
            type: sessionType.type,
            count: sessionType.count,
            state: sessionState,
            timer: sessionTimer,
            length: sessionLength,
            lap: sessionLap,
            laps: sessionLaps,
            entries: new Map<number, TimeData | RaceData>(),
          };

          let entryOffset = this.offset + 7;

          const isPractise =
            sessionType.type === SessionType.PRACTICE ||
            sessionType.type === SessionType.QUALIFY ||
            sessionType.type === SessionType.WARMUP;

          const readEntry = () => {
            const raceNumber = parseInt(this.lines[entryOffset]);
            entryOffset++;

            let entry: TimeData | RaceData | undefined;

            if (isPractise) {
              entry = {
                raceNumber,
                lapTime: 0,
                lapNumber: 0,
                totalLaps: 0,
                gap: "--",
                speed: 0,
                status: KartStatus.NONE,
              } as TimeData;

              entry.lapTime = parseFloat(this.lines[entryOffset]);
              entryOffset++;

              if (entry.lapTime !== 0) {
                entry.lapNumber = parseInt(this.lines[entryOffset]);
                entryOffset++;
                entry.totalLaps = parseInt(this.lines[entryOffset]);
                entryOffset++;
                const gap = this.lines[entryOffset];
                entry.gap = gap === "--" ? "--" : parseFloat(gap);
                entryOffset++;
                entry.speed = parseFloat(this.lines[entryOffset]);
                entryOffset++;
              }
            } else {
              entry = {
                raceNumber,
                raceTime: 0,
                lapNumber: 0,
                gap: 0,
                status: KartStatus.NONE,
              } as RaceData;

              const raceTime = this.lines[entryOffset];
              entry.raceTime = Object.values(RaceStatus).includes(
                raceTime as RaceStatus,
              )
                ? (raceTime as RaceStatus)
                : parseFloat(raceTime);
              entryOffset++;

              if (entry.raceTime !== 0 && typeof entry.raceTime === "number") {
                entry.lapNumber = parseInt(this.lines[entryOffset]);
                entryOffset++;
                const gap = this.lines[entryOffset];
                entry.gap = gap === "L" ? "L" : parseFloat(gap);
                entryOffset++;
              }
            }

            entry.status = this.lines[entryOffset] as KartStatus;
            entryOffset++;

            classification.entries.set(raceNumber, entry);
          };

          while (this.lines[entryOffset] !== "") readEntry();

          currentSession.classification = classification;
          this.data.sessions.set(sessionType.combined, currentSession);
        }
        break;
    }
  }

  private readContact() {
    this.data.contacts.push({
      time: parseFloat(this.lines[this.offset + 1]),
      raceNumbers: Vec2(
        parseInt(this.lines[this.offset + 2]),
        parseInt(this.lines[this.offset + 3]),
      ),
      velocity: parseFloat(this.lines[this.offset + 4]),
    });
  }

  private readTrackData() {
    const type = this.lines[this.offset] as DataType;

    switch (type) {
      case DataType.TRACKDATA:
        {
          this.data.trackData = {
            startPosition: parseFloat(this.lines[this.offset + 1]),
            splitPositions: Vec2(
              parseFloat(this.lines[this.offset + 2]),
              parseFloat(this.lines[this.offset + 3]),
            ),
            speedTrapPosition: parseFloat(this.lines[this.offset + 4]),
            numSegments: parseInt(this.lines[this.offset + 5]),
            segments: new Map<number, TrackSegment>(),
            positions: new Map<number, TrackPosition>(),
          };
        }
        break;
      case DataType.TRACKSEGMENT:
        {
          if (!this.data.trackData) break;

          const data = {
            segmentNumber: parseInt(this.lines[this.offset + 1]),
            type: parseInt(this.lines[this.offset + 2]) as TrackSegmentType,
            length: parseFloat(this.lines[this.offset + 3]),
            radius: parseFloat(this.lines[this.offset + 4]),
            angle: parseFloat(this.lines[this.offset + 5]),
            startPosition: Vec3(
              parseFloat(this.lines[this.offset + 6]),
              parseFloat(this.lines[this.offset + 8]),
              parseFloat(this.lines[this.offset + 7]),
            ),
          } as TrackSegment;

          this.data.trackData.segments.set(data.segmentNumber, data);
        }
        break;
      case DataType.TRACKPOSITION:
        {
          if (!this.data.trackData) break;
          let entryOffset = this.offset + 1;

          const readEntry = () => {
            if (!this.data.trackData) return;

            const data = {
              raceNumber: parseInt(this.lines[entryOffset]),
              position: Vec3(
                parseFloat(this.lines[entryOffset + 1]),
                parseFloat(this.lines[entryOffset + 2]),
                parseFloat(this.lines[entryOffset + 3]),
              ),
            } as TrackPosition;

            this.data.trackData?.positions.set(data.raceNumber, data);
            entryOffset += 4;
          };

          while (this.lines[entryOffset] !== "") readEntry();
        }
        break;
    }
  }

  private getCurrentSessionKey() {
    const sessions = this.data.sessions;
    if (sessions.size === 0) return undefined;

    for (const session of sessions.values()) {
      if (
        session.state === SessionState.COMPLETE ||
        session.state === SessionState.NONE
      )
        continue;
      return `${session.type}${session.count ? " " + session.count : ""}`;
    }

    return sessions.keys().next().value;
  }

  private readSessionType(str: string) {
    const split = str.toUpperCase().split(" ");
    return {
      type: split[0] as SessionType,
      count: parseInt(split[1]) || undefined,
      combined: str,
    };
  }
}
