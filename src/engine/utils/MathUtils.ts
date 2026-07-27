/**
 * Stage 2: utils/MathUtils.ts
 * Fundamental mathematical utilities dependent on Constants.ts
 */
import { DEFAULT_SNAP_THRESHOLD } from '../Constants';

export class MathUtils {
  public static DEG2RAD = Math.PI / 180;
  public static RAD2DEG = 180 / Math.PI;

  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  public static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  public static smoothstep(x: number, min: number, max: number): number {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
  }

  public static degToRad(degrees: number): number {
    return degrees * MathUtils.DEG2RAD;
  }

  public static radToDeg(radians: number): number {
    return radians * MathUtils.RAD2DEG;
  }

  public static isNear(val1: number, val2: number, threshold = DEFAULT_SNAP_THRESHOLD): boolean {
    return Math.abs(val1 - val2) <= threshold;
  }

  public static generateUUID(prefix = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
}

export const clamp = MathUtils.clamp;
export const lerp = MathUtils.lerp;
export const degToRad = MathUtils.degToRad;
export const radToDeg = MathUtils.radToDeg;
