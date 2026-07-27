import { EngineState } from '../../types/timeline';

export class HistoryManager {
  private _historyStack: EngineState[] = [];

  public constructor() {}

  public _pushSnapshot(state: EngineState): void {
    if (state.historyIndex < this._historyStack.length - 1) {
      this._historyStack = this._historyStack.slice(0, state.historyIndex + 1);
    }
    this._historyStack.push(JSON.parse(JSON.stringify(state)));
    if (this._historyStack.length > 50) {
      this._historyStack.shift();
    }
    state.historyIndex = this._historyStack.length - 1;
    this._updateFlags(state);
  }

  public _undo(currentState: EngineState): EngineState | null {
    if (currentState.canUndo && currentState.historyIndex > 0) {
      currentState.historyIndex--;
      const restored = JSON.parse(JSON.stringify(this._historyStack[currentState.historyIndex])) as EngineState;
      this._updateFlags(restored);
      return restored;
    }
    return null;
  }

  public _redo(currentState: EngineState): EngineState | null {
    if (currentState.canRedo && currentState.historyIndex < this._historyStack.length - 1) {
      currentState.historyIndex++;
      const restored = JSON.parse(JSON.stringify(this._historyStack[currentState.historyIndex])) as EngineState;
      this._updateFlags(restored);
      return restored;
    }
    return null;
  }

  public _updateFlags(state: EngineState): void {
    state.canUndo = state.historyIndex > 0;
    state.canRedo = state.historyIndex < this._historyStack.length - 1;
  }
}
