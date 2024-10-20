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
