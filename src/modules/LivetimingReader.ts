import { DataType } from "../enums/DataType";
import { ChallengeType } from "../enums/Event/ChallengeType";
import { EventType } from "../enums/Event/EventType";
import { LiveTimingData } from "../interfaces/LiveTimingData";

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
    console.log(this.lines);

    const updated: string[] = [];
    while (this.offset !== -1) {
      const type = this.lines[this.offset] as DataType;
      updated.push(type);

      switch (type) {
        case DataType.EVENT:
          this.readEvent();
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

    console.log(updated);
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
}
