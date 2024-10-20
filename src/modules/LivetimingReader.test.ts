import { ChallengeType } from "../enums/Event/ChallengeType";
import { EventType } from "../enums/Event/EventType";
import { KartStatus } from "../enums/Session/Classification/KartStatus";
import { DriverStatusReason } from "../enums/Session/SessionEntry/DriverStatusReason";
import { DriverStatusState } from "../enums/Session/SessionEntry/DriverStatusState";
import { PenaltyOffence } from "../enums/Session/SessionEntry/PenaltyOffence";
import { PenaltyType } from "../enums/Session/SessionEntry/PenaltyType";
import { SessionState } from "../enums/Session/SessionState";
import { SessionType } from "../enums/Session/SessionType";
import { WeatherCondition } from "../enums/Session/WeatherCondition";
import { TrackSegmentType } from "../enums/TrackData/TrackSegmentType";
import { Entry } from "../interfaces/Entry/Entry";
import { ChallengeEvent } from "../interfaces/Event/ChallengeEvent";
import { LiveTimingData } from "../interfaces/LiveTimingData";
import { TimeData } from "../interfaces/Session/Classification/TimeData";
import { Session } from "../interfaces/Session/Session";
import { LivetimingReader } from "./LivetimingReader";

function createEmptyData(): LiveTimingData {
  return {
    entries: new Map<number, Entry>(),
    sessions: new Map<SessionType, Session>(),
    contacts: [],
  };
}

describe("LivetimingReader", () => {
  test("Read Event", () => {
    const data = [
      "MSG",
      "1",
      "EVENT",
      "RACE",
      "Testing Event",
      "Lonato",
      "1187.2",
      "KF1/FS250/F100",
      "",
    ];

    let result = createEmptyData();
    const reader = new LivetimingReader(data, result);
    result = reader.read();

    expect(result.event?.type).toBe(EventType.RACE);
    expect(result.event?.name).toBe("Testing Event");
    expect(result.event?.track.name).toBe("Lonato");
    expect(result.event?.track.length).toBe(1187.2);
    expect(result.event?.allowed).toStrictEqual(["KF1", "FS250", "F100"]);
  });

  test("Read ChallengeData", () => {
    const data = [
      "MSG",
      "1",
      "EVENT",
      "CHALLENGE",
      "Testing Event",
      "Lonato",
      "1187.2",
      "KF1/FS250/F100",
      "RACE",
      "10",
      "1",
      "",
      "CHALLENGEDATA",
      "FynniX",
      "CRG KF1",
      "CRG KF1",
      "FF011000010893E603",
      "",
      "1",
      "",
    ];

    let result = createEmptyData();
    const reader = new LivetimingReader(data, result);
    result = reader.read();

    expect(result.event).toBeDefined();
    const event = result.event as ChallengeEvent;
    expect(event.type).toBe(EventType.CHALLENGE);
    expect(event.name).toBe("Testing Event");
    expect(event.track.name).toBe("Lonato");
    expect(event.track.length).toBe(1187.2);
    expect(event.allowed).toStrictEqual(["KF1", "FS250", "F100"]);
    expect(event.challengeType).toBe(ChallengeType.RACE);
    expect(event.challengeLength).toBe(10);
    expect(event.challengeMaxTries).toBe(1);

    expect(event.challengeData.has("FF011000010893E603")).toBe(true);
    const challengeData = event.challengeData.get("FF011000010893E603");
    expect(challengeData?.name).toBe("FynniX");
    expect(challengeData?.kart.name).toBe("CRG KF1");
    expect(challengeData?.kart.shortName).toBe("CRG KF1");
    expect(challengeData?.guid).toBe("FF011000010893E603");
    expect(challengeData?.extra).toBe("");
    expect(challengeData?.try).toBe(1);
  });

  test("Read Session", () => {
    const data = [
      "MSG",
      "1",
      "SESSION",
      "PRACTICE 1",
      "INPROGRESS",
      "30",
      "",
      "WEATHER",
      "CLEAR",
      "20.0",
      "34.3",
      "",
      "SESSIONENTRY",
      "2",
      "",
      "BESTLAP",
      "2",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0.0",
      "",
      "LASTLAP",
      "2",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0.0",
      "",
      "CLASSIFICATION",
      "PRACTICE 1",
      "INPROGRESS",
      "1028850",
      "30",
      "0",
      "0",
      "2",
      "0",
      "TRK",
      "",
      "DRIVERSTATUS",
      "2",
      "DSQ",
      "JUMPSTART",
      "",
      "LAP",
      "2",
      "0",
      "1000",
      "10",
      "5",
      "8",
      "10",
      "",
      "SPLIT",
      "2",
      "1",
      "10",
      "",
      "SPEED",
      "2",
      "10",
      "",
      "PENALTY",
      "2",
      "0",
      "TIME",
      "5",
      "JUMPSTART",
      "",
    ];

    let result = createEmptyData();
    const reader = new LivetimingReader(data, result);
    result = reader.read();

    expect(result.sessions.has("PRACTICE 1")).toBe(true);
    const session = result.sessions.get("PRACTICE 1");
    expect(session?.type).toBe(SessionType.PRACTICE);
    expect(session?.count).toBe(1);
    expect(session?.state).toBe(SessionState.INPROGRESS);
    expect(session?.length).toBe(30);
    expect(session?.weather?.condition).toBe(WeatherCondition.CLEAR);
    expect(session?.weather?.air).toBe(20);
    expect(session?.weather?.track).toBe(34.3);
    expect(session?.classification?.type).toBe(SessionType.PRACTICE);
    expect(session?.classification?.count).toBe(1);
    expect(session?.classification?.state).toBe(SessionState.INPROGRESS);
    expect(session?.classification?.timer).toBe(1028850);
    expect(session?.classification?.length).toBe(30);
    expect(session?.classification?.lap).toBe(0);
    expect(session?.classification?.laps).toBe(0);

    expect(session?.classification?.entries.has(2)).toBe(true);
    const entry = session?.classification?.entries.get(2) as TimeData;
    expect(entry?.raceNumber).toBe(2);
    expect(entry?.lapTime).toBe(0);
    expect(entry?.lapNumber).toBe(0);
    expect(entry?.totalLaps).toBe(0);
    expect(entry?.gap).toBe("--");
    expect(entry?.speed).toBe(0);
    expect(entry?.status).toBe(KartStatus.TRK);

    expect(session?.entries.has(2)).toBe(true);
    const sessionEntry = session?.entries.get(2);
    expect(sessionEntry?.raceNumber).toBe(2);
    expect(sessionEntry?.state).toBe(DriverStatusState.DSQ);
    expect(sessionEntry?.reason).toBe(DriverStatusReason.JUMPSTART);
    expect(sessionEntry?.bestLap?.raceNumber).toBe(2);
    expect(sessionEntry?.bestLap?.sessionTime).toBe(0);
    expect(sessionEntry?.bestLap?.lapTime).toBe(0);
    expect(sessionEntry?.bestLap?.lapNumber).toBe(0);
    expect(sessionEntry?.bestLap?.splits.x).toBe(0);
    expect(sessionEntry?.bestLap?.splits.y).toBe(0);
    expect(sessionEntry?.bestLap?.speed).toBe(0);
    expect(sessionEntry?.lastLap?.raceNumber).toBe(2);
    expect(sessionEntry?.lastLap?.sessionTime).toBe(0);
    expect(sessionEntry?.lastLap?.lapTime).toBe(0);
    expect(sessionEntry?.lastLap?.lapNumber).toBe(0);
    expect(sessionEntry?.lastLap?.splits.x).toBe(0);
    expect(sessionEntry?.lastLap?.splits.y).toBe(0);
    expect(sessionEntry?.lastLap?.speed).toBe(0);

    expect(sessionEntry?.laps.length).toBe(1);
    const lap = sessionEntry?.laps[0];
    expect(lap?.raceNumber).toBe(2);
    expect(lap?.invalid).toBe(false);
    expect(lap?.sessionTime).toBe(1000);
    expect(lap?.lapTime).toBe(10);
    expect(lap?.splits.x).toBe(5);
    expect(lap?.splits.y).toBe(8);
    expect(lap?.speed).toBe(10);

    expect(sessionEntry?.splits.length).toBe(1);
    const split = sessionEntry?.splits[0];
    expect(split?.raceNumber).toBe(2);
    expect(split?.splitNumber).toBe(1);
    expect(split?.splitTime).toBe(1);

    expect(sessionEntry?.speeds.length).toBe(1);
    const speeds = sessionEntry?.speeds[0];
    expect(speeds?.raceNumber).toBe(2);
    expect(speeds?.speed).toBe(10);

    expect(sessionEntry?.penalties.length).toBe(1);
    const penalty = sessionEntry?.penalties[0];
    expect(penalty?.raceNumber).toBe(2);
    expect(penalty?.penaltyNumber).toBe(0);
    expect(penalty?.type).toBe(PenaltyType.TIME);
    expect(penalty?.penalty).toBe(5);
    expect(penalty?.offence).toBe(PenaltyOffence.JUMPSTART);
  });

  test("Read Entry (Add)", () => {
    const data = [
      "MSG",
      "1",
      "ENTRY",
      "2",
      "FynniX",
      "CRG KF1",
      "CRG KF1",
      "KF1",
      "FF011000010893E603",
      "",
      "",
    ];

    let result = createEmptyData();
    const reader = new LivetimingReader(data, result);
    result = reader.read();

    expect(result.entries.has(2)).toBe(true);
    const entry = result.entries.get(2);
    expect(entry?.raceNumber).toBe(2);
    expect(entry?.name).toBe("FynniX");
    expect(entry?.kart.name).toBe("CRG KF1");
    expect(entry?.kart.shortName).toBe("CRG KF1");
    expect(entry?.kart.categories).toStrictEqual(["KF1"]);
    expect(entry?.guid).toBe("FF011000010893E603");
    expect(entry?.extra).toBe("");
    expect(entry?.online).toBe(true);
  });

  test("Read Entry (Remove)", () => {
    const data = [
      "MSG",
      "1",
      "ENTRY",
      "2",
      "FynniX",
      "CRG KF1",
      "CRG KF1",
      "KF1",
      "FF011000010893E603",
      "",
      "",
      "ENTRYREMOVE",
      "2",
      "",
    ];

    let result = createEmptyData();
    const reader = new LivetimingReader(data, result);
    result = reader.read();

    expect(result.entries.has(2)).toBe(true);
    const entry = result.entries.get(2);
    expect(entry?.raceNumber).toBe(2);
    expect(entry?.name).toBe("FynniX");
    expect(entry?.kart.name).toBe("CRG KF1");
    expect(entry?.kart.shortName).toBe("CRG KF1");
    expect(entry?.kart.categories).toStrictEqual(["KF1"]);
    expect(entry?.guid).toBe("FF011000010893E603");
    expect(entry?.extra).toBe("");
    expect(entry?.online).toBe(false);
  });

  test("Read TrackData", () => {
    const data = [
      "MSG",
      "1",
      "TRACKDATA",
      "1180.2",
      "395.7",
      "791.4",
      "65.0",
      "1",
      "",
      "TRACKSEGMENT",
      "0",
      "0",
      "56.308",
      "0.000",
      "5.217",
      "-47.795",
      "-40.587",
      "0.033",
      "",
      "TRACKPOSITION",
      "2",
      "1.0",
      "2.0",
      "3.0",
      "3",
      "1.0",
      "2.0",
      "3.0",
      "",
    ];

    let result = createEmptyData();
    const reader = new LivetimingReader(data, result);
    result = reader.read();

    expect(result.trackData).toBeDefined();
    expect(result.trackData?.startPosition).toBe(1180.2);
    expect(result.trackData?.splitPositions.x).toBe(395.7);
    expect(result.trackData?.splitPositions.y).toBe(791.4);
    expect(result.trackData?.speedTrapPosition).toBe(65);
    expect(result.trackData?.numSegments).toBe(1);

    expect(result.trackData?.segments.has(0)).toBe(true);
    const segment = result.trackData?.segments.get(0);
    expect(segment?.segmentNumber).toBe(0);
    expect(segment?.type).toBe(TrackSegmentType.STRAIGHT);
    expect(segment?.length).toBe(56.308);
    expect(segment?.radius).toBe(0.0);
    expect(segment?.angle).toBe(5.217);
    expect(segment?.startPosition.x).toBe(-47.795);
    expect(segment?.startPosition.z).toBe(-40.587);
    expect(segment?.startPosition.y).toBe(0.033);

    expect(result.trackData?.positions.has(2)).toBe(true);
    const position = result.trackData?.positions.get(2);
    expect(position?.raceNumber).toBe(2);
    expect(position?.position.x).toBe(1.0);
    expect(position?.position.y).toBe(2.0);
    expect(position?.position.z).toBe(3.0);

    expect(result.trackData?.positions.has(3)).toBe(true);
    const position2 = result.trackData?.positions.get(3);
    expect(position2?.raceNumber).toBe(3);
    expect(position2?.position.x).toBe(1.0);
    expect(position2?.position.y).toBe(2.0);
    expect(position2?.position.z).toBe(3.0);
  });

  test("Read Contact", () => {
    const data = ["MSG", "1", "CONTACT", "1000", "1", "2", "10.0", ""];

    let result = createEmptyData();
    const reader = new LivetimingReader(data, result);
    result = reader.read();

    expect(result.contacts.length).toBe(1);
    const contact = result.contacts[0];
    expect(contact.time).toBe(1000);
    expect(contact.raceNumbers.x).toBe(1);
    expect(contact.raceNumbers.y).toBe(2);
    expect(contact.velocity).toBe(10.0);
  });
});
