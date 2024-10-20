import { Vec3 as IVec3 } from "../interfaces/Vec3";

export function Vec3(x: number, y: number, z: number): IVec3 {
  return { x, y, z };
}
