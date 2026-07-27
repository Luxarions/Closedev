/**
 * Stage 3: math/Vector2.ts
 * 2D Vector math class built upon MathUtils & Constants
 */
import { MathUtils } from '../utils/MathUtils';

export class Vector2 {
  public x: number;
  public y: number;

  public constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public copy(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  public add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  public distanceTo(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public lerp(v: Vector2, alpha: number): this {
    this.x = MathUtils.lerp(this.x, v.x, alpha);
    this.y = MathUtils.lerp(this.y, v.y, alpha);
    return this;
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}
