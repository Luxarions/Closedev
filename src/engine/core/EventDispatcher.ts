export interface BaseEvent {
  type: string;
  [key: string]: any;
}

export type EventListener = (event: BaseEvent) => void;

/**
 * EventDispatcher class for handling custom events in the engine.
 * Similar to Three.js EventDispatcher.
 */
export class EventDispatcher {
  private _listeners: Map<string, Set<EventListener>> = new Map();

  public addEventListener(type: string, listener: EventListener): void {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type)!.add(listener);
  }

  public hasEventListener(type: string, listener: EventListener): boolean {
    const set = this._listeners.get(type);
    return set ? set.has(listener) : false;
  }

  public removeEventListener(type: string, listener: EventListener): void {
    const set = this._listeners.get(type);
    if (set) {
      set.delete(listener);
    }
  }

  public dispatchEvent(event: BaseEvent): void {
    const set = this._listeners.get(event.type);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in event listener for event '${event.type}':`, err);
        }
      });
    }
  }
}
