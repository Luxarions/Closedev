/**
 * Stage 3: math/Vector3.ts
 * 3D Vector math class built upon MathUtils
 */
import { MathUtils } from '../utils/MathUtils';

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  public constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public add(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  public lerp(v: Vector3, alpha: number): this {
    this.x = MathUtils.lerp(this.x, v.x, alpha);
    this.y = MathUtils.lerp(this.y, v.y, alpha);
    this.z = MathUtils.lerp(this.z, v.z, alpha);
    return this;
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }
}
