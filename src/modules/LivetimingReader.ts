import { DataType } from "../enums/DataType";
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
}
