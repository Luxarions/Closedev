import { EventDispatcher } from './EventDispatcher';
import { TransformProps } from '../types/timeline';

/**
 * Abstract base class for all timeline items (clips, tracks, elements).
 * Modeled after Three.js Object3D architecture.
 * 
 * @abstract
 * @augments EventDispatcher
 */
export abstract class TimelineItem extends EventDispatcher {
  public isTimelineItem = true;
  public type = 'TimelineItem';

  public id: string;
  public name: string;
  public startTime: number;
  public duration: number;

  protected _parent: TimelineItem | null = null;
  protected _children: TimelineItem[] = [];

  public constructor() {
    super();
    this.id = this.generateId();
    this.name = '';
    this.startTime = 0;
    this.duration = 5;
  }

  public generateId(): string {
    return `${this.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  public get parent(): TimelineItem | null {
    return this._parent;
  }

  public set parent(value: TimelineItem | null) {
    this._parent = value;
    this.dispatchEvent({ type: 'parentChanged', value });
  }

  public get children(): TimelineItem[] {
    return [...this._children];
  }

  public addChild(child: TimelineItem): this {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this._children.push(child);
    this.dispatchEvent({ type: 'childAdded', child });
    return this;
  }

  public removeChild(child: TimelineItem): this {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      child.parent = null;
      this._children.splice(index, 1);
      this.dispatchEvent({ type: 'childRemoved', child });
    }
    return this;
  }

  public copy(source: TimelineItem, recursive = false): this {
    this.id = source.id;
    this.name = source.name;
    this.startTime = source.startTime;
    this.duration = source.duration;

    if (recursive) {
      this._children = [];
      for (const child of source.children) {
        this.addChild(child.clone());
      }
    }

    return this;
  }

  public clone(): TimelineItem {
    return new (this.constructor as any)().copy(this);
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      startTime: this.startTime,
      duration: this.duration,
      type: this.type,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.startTime = data.startTime || 0;
    this.duration = data.duration || 5;
    return this;
  }
}
