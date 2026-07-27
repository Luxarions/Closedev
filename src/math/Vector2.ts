import { MathUtils } from '../engine/utils/MathUtils';

/**
 * Class representing a 2D vector.
 */
export class Vector2 {
  public isVector2 = true;
  public x: number;
  public y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get width(): number {
    return this.x;
  }
  set width(value: number) {
    this.x = value;
  }

  get height(): number {
    return this.y;
  }
  set height(value: number) {
    this.y = value;
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  setScalar(scalar: number): this {
    this.x = scalar;
    this.y = scalar;
    return this;
  }

  setX(x: number): this {
    this.x = x;
    return this;
  }

  setY(y: number): this {
    this.y = y;
    return this;
  }

  setComponent(index: number, value: number): this {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      default:
        throw new Error('Vector2: index is out of range: ' + index);
    }
    return this;
  }

  getComponent(index: number): number {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error('Vector2: index is out of range: ' + index);
    }
  }

  clone(): Vector2 {
    return new (this.constructor as any)(this.x, this.y);
  }

  copy(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  addScalar(s: number): this {
    this.x += s;
    this.y += s;
    return this;
  }

  addVectors(a: Vector2, b: Vector2): this {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  }

  addScaledVector(v: Vector2, s: number): this {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }

  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  subScalar(s: number): this {
    this.x -= s;
    this.y -= s;
    return this;
  }

  subVectors(a: Vector2, b: Vector2): this {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  }

  multiply(v: Vector2): this {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(v: Vector2): this {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  divideScalar(scalar: number): this {
    return this.multiplyScalar(1 / scalar);
  }

  applyMatrix3(m: { elements: number[] | Float32Array }): this {
    const x = this.x,
      y = this.y;
    const e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];

    return this;
  }

  min(v: Vector2): this {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }

  max(v: Vector2): this {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }

  clamp(min: Vector2, max: Vector2): this {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }

  clampScalar(minVal: number, maxVal: number): this {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    return this;
  }

  clampLength(min: number, max: number): this {
    const length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  floor(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  ceil(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  roundToZero(): this {
    this.x = Math.trunc(this.x);
    this.y = Math.trunc(this.y);
    return this;
  }

  negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  manhattanLength(): number {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  normalize(): this {
    return this.divideScalar(this.length() || 1);
  }

  angle(): number {
    const angle = Math.atan2(-this.y, -this.x) + Math.PI;
    return angle;
  }

  angleTo(v: Vector2): number {
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
    if (denominator === 0) return Math.PI / 2;
    const theta = this.dot(v) / denominator;
    return Math.acos(MathUtils.clamp(theta, -1, 1));
  }

  distanceTo(v: Vector2): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector2): number {
    const dx = this.x - v.x,
      dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  manhattanDistanceTo(v: Vector2): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  setLength(length: number): this {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vector2, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  lerpVectors(v1: Vector2, v2: Vector2, alpha: number): this {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    return this;
  }

  equals(v: Vector2): boolean {
    return v.x === this.x && v.y === this.y;
  }

  fromArray(array: number[] | ArrayLike<number>, offset = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  }

  toArray(array: number[] = [], offset = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  }

  fromBufferAttribute(attribute: { getX(index: number): number; getY(index: number): number }, index: number): this {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    return this;
  }

  rotateAround(center: Vector2, angle: number): this {
    const c = Math.cos(angle),
      s = Math.sin(angle);

    const x = this.x - center.x;
    const y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  random(): this {
    this.x = Math.random();
    this.y = Math.random();
    return this;
  }

  *[Symbol.iterator](): Generator<number, void, unknown> {
    yield this.x;
    yield this.y;
  }
}
