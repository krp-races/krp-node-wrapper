import { WeatherCondition } from "../../enums/Session/WeatherCondition";

export interface Weather {
  condition: WeatherCondition;
  air: number;
  track: number;
}
