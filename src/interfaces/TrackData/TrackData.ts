import { Vec2 } from "../Vec2";
import { TrackPosition } from "./TrackPosition";
import { TrackSegment } from "./TrackSegment";

export interface TrackData {
  startPosition: number;
  splitPositions: Vec2;
  speedTrapPosition: number;
  numSegments: number;
  segments: Map<number, TrackSegment>;
  positions: Map<number, TrackPosition>;
}
