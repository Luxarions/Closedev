import {
  AlwaysDepth,
  EqualDepth,
  GreaterDepth,
  GreaterEqualDepth,
  LessDepth,
  LessEqualDepth,
  NeverDepth,
  NotEqualDepth,
} from '../core/Constants';

/**
 * Finds the minimum value in an array.
 */
export function arrayMin(array: number[] | ArrayLike<number>): number {
  if (array.length === 0) return Infinity;
  let min = array[0];
  for (let i = 1, l = array.length; i < l; ++i) {
    if (array[i] < min) min = array[i];
  }
  return min;
}

/**
 * Finds the maximum value in an array.
 */
export function arrayMax(array: number[] | ArrayLike<number>): number {
  if (array.length === 0) return -Infinity;
  let max = array[0];
  for (let i = 1, l = array.length; i < l; ++i) {
    if (array[i] > max) max = array[i];
  }
  return max;
}

/**
 * Checks if an array contains values that require Uint32 representation (>= 65535).
 */
export function arrayNeedsUint32(array: number[] | ArrayLike<number>): boolean {
  for (let i = array.length - 1; i >= 0; --i) {
    if (array[i] >= 65535) return true;
  }
  return false;
}

export type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Uint8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export const TYPED_ARRAYS: Record<string, TypedArrayConstructor> = {
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
};

/**
 * Creates a typed array of the specified type from the given buffer.
 */
export function getTypedArray(type: keyof typeof TYPED_ARRAYS, buffer: ArrayBufferLike): InstanceType<TypedArrayConstructor> {
  const Ctor = TYPED_ARRAYS[type];
  return new Ctor(buffer as any) as any;
}

/**
 * Returns `true` if the given object is a typed array.
 */
export function isTypedArray(array: any): boolean {
  return ArrayBuffer.isView(array) && !(array instanceof DataView);
}

/**
 * Creates an XHTML element with the specified tag name.
 */
export function createElementNS(name: string): HTMLElement {
  return document.createElementNS('http://www.w3.org/1999/xhtml', name) as HTMLElement;
}

/**
 * Creates a canvas element configured for block display.
 */
export function createCanvasElement(): HTMLCanvasElement {
  const canvas = createElementNS('canvas') as HTMLCanvasElement;
  canvas.style.display = 'block';
  return canvas;
}

const _cache: Record<string, boolean> = {};
let _setConsoleFunction: ((type: string, message: string, ...params: any[]) => void) | null = null;

export function setConsoleFunction(fn: typeof _setConsoleFunction): void {
  _setConsoleFunction = fn;
}

export function getConsoleFunction() {
  return _setConsoleFunction;
}

export function log(...params: any[]): void {
  const message = 'ENGINE.' + params.shift();
  if (_setConsoleFunction) {
    _setConsoleFunction('log', message, ...params);
  } else {
    console.log(message, ...params);
  }
}

export function enhanceLogMessage(params: any[]): any[] {
  const message = params[0];
  if (typeof message === 'string' && message.startsWith('TSL:')) {
    const stackTrace = params[1];
    if (stackTrace && stackTrace.isStackTrace) {
      params[0] += ' ' + stackTrace.getLocation();
    } else {
      params[1] = 'Stack trace not available.';
    }
  }
  return params;
}

export function warn(...params: any[]): void {
  const enhancedParams = enhanceLogMessage(params);
  const message = 'ENGINE.' + enhancedParams.shift();
  if (_setConsoleFunction) {
    _setConsoleFunction('warn', message, ...enhancedParams);
  } else {
    const stackTrace = enhancedParams[0];
    if (stackTrace && stackTrace.isStackTrace) {
      console.warn(stackTrace.getError(message));
    } else {
      console.warn(message, ...enhancedParams);
    }
  }
}

export function error(...params: any[]): void {
  const enhancedParams = enhanceLogMessage(params);
  const message = 'ENGINE.' + enhancedParams.shift();
  if (_setConsoleFunction) {
    _setConsoleFunction('error', message, ...enhancedParams);
  } else {
    const stackTrace = enhancedParams[0];
    if (stackTrace && stackTrace.isStackTrace) {
      console.error(stackTrace.getError(message));
    } else {
      console.error(message, ...enhancedParams);
    }
  }
}

export function warnOnce(...params: any[]): void {
  const message = params.join(' ');
  if (message in _cache) return;
  _cache[message] = true;
  warn(...params);
}

export function yieldToMain(): Promise<void> {
  if (typeof self !== 'undefined' && (self as any).scheduler?.yield) {
    return (self as any).scheduler.yield();
  }
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export function probeAsync(gl: WebGL2RenderingContext, sync: WebGLSync, interval: number): Promise<void> {
  return new Promise((resolve, reject) => {
    function probe() {
      switch (gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case gl.WAIT_FAILED:
          reject();
          break;
        case gl.TIMEOUT_EXPIRED:
          setTimeout(probe, interval);
          break;
        default:
          resolve();
      }
    }
    setTimeout(probe, interval);
  });
}

export function toNormalizedProjectionMatrix(projectionMatrix: { elements: Float32Array | number[] }): void {
  const m = projectionMatrix.elements;
  m[2] = 0.5 * m[2] + 0.5 * m[3];
  m[6] = 0.5 * m[6] + 0.5 * m[7];
  m[10] = 0.5 * m[10] + 0.5 * m[11];
  m[14] = 0.5 * m[14] + 0.5 * m[15];
}

export function toReversedProjectionMatrix(projectionMatrix: { elements: Float32Array | number[] }): void {
  const m = projectionMatrix.elements;
  const isPerspectiveMatrix = m[11] === -1;
  if (isPerspectiveMatrix) {
    m[10] = -m[10] - 1;
    m[14] = -m[14];
  } else {
    m[10] = -m[10];
    m[14] = -m[14] + 1;
  }
}

export const ReversedDepthFuncs: Record<number, number> = {
  [NeverDepth]: AlwaysDepth,
  [LessDepth]: GreaterDepth,
  [EqualDepth]: NotEqualDepth,
  [LessEqualDepth]: GreaterEqualDepth,

  [AlwaysDepth]: NeverDepth,
  [GreaterDepth]: LessDepth,
  [NotEqualDepth]: EqualDepth,
  [GreaterEqualDepth]: LessEqualDepth,
};
