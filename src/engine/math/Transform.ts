/**
 * Stage 3: math/Transform.ts
 * Transform 2D/3D matrix encapsulation relying on Vector2 & Vector3 & DEFAULT_TRANSFORM_PROPS
 */
import { Vector2 } from './Vector2';
import { DEFAULT_TRANSFORM_PROPS } from '../Constants';

export class Transform {
  public position: Vector2;
  public scale: number;
  public rotation: number;
  public opacity: number;

  public constructor(
    x = DEFAULT_TRANSFORM_PROPS.x,
    y = DEFAULT_TRANSFORM_PROPS.y,
    scale = DEFAULT_TRANSFORM_PROPS.scale,
    rotation = DEFAULT_TRANSFORM_PROPS.rotation,
    opacity = DEFAULT_TRANSFORM_PROPS.opacity
  ) {
    this.position = new Vector2(x, y);
    this.scale = scale;
    this.rotation = rotation;
    this.opacity = opacity;
  }

  public copy(t: Transform): this {
    this.position.copy(t.position);
    this.scale = t.scale;
    this.rotation = t.rotation;
    this.opacity = t.opacity;
    return this;
  }

  public clone(): Transform {
    return new Transform(
      this.position.x,
      this.position.y,
      this.scale,
      this.rotation,
      this.opacity
    );
  }

  public toJSON(): Record<string, any> {
    return {
      x: this.position.x,
      y: this.position.y,
      scale: this.scale,
      rotation: this.rotation,
      opacity: this.opacity,
    };
  }

  public fromJSON(data: Partial<{ x: number; y: number; scale: number; rotation: number; opacity: number }>): this {
    this.position.set(data.x ?? 0, data.y ?? 0);
    this.scale = data.scale ?? 1;
    this.rotation = data.rotation ?? 0;
    this.opacity = data.opacity ?? 1;
    return this;
  }
}
