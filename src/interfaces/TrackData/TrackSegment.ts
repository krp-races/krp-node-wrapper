import { TrackSegmentType } from "../../enums/TrackData/TrackSegmentType";
import { Vec3 } from "../Vec3";

export interface TrackSegment {
  segmentNumber: number;
  type: TrackSegmentType;
  length: number;
  radius: number;
  angle: number;
  startPosition: Vec3;
}
