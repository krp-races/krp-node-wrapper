import { EventType } from "../enums/Event/EventType";
import { SessionType } from "../enums/Session/SessionType";
import { Entry } from "../interfaces/Entry/Entry";
import { LiveTimingData } from "../interfaces/LiveTimingData";
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
});
