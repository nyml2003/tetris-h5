import { vi } from "vitest";

export class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  readonly observe = vi.fn((target: Element) => {
    void target;
  });

  readonly unobserve = vi.fn((target: Element) => {
    void target;
  });

  readonly disconnect = vi.fn();

  constructor(public readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  static install() {
    ResizeObserverMock.instances = [];
    vi.stubGlobal(
      "ResizeObserver",
      ResizeObserverMock as unknown as typeof ResizeObserver
    );

    if (typeof window !== "undefined") {
      Object.defineProperty(window, "ResizeObserver", {
        configurable: true,
        value: ResizeObserverMock,
      });
    }

    return ResizeObserverMock;
  }
}

export function emitResize(target?: Element) {
  for (const instance of ResizeObserverMock.instances) {
    const entries = target ? [{ target }] : [];

    instance.callback(
      entries as ResizeObserverEntry[],
      instance as unknown as ResizeObserver
    );
  }
}

export function installRafMock() {
  let nextId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();

  const request = vi.fn((callback: FrameRequestCallback) => {
    nextId += 1;
    callbacks.set(nextId, callback);
    return nextId;
  });

  const cancel = vi.fn((id: number) => {
    callbacks.delete(id);
  });

  vi.stubGlobal("requestAnimationFrame", request);
  vi.stubGlobal("cancelAnimationFrame", cancel);

  if (typeof window !== "undefined") {
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: request,
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: cancel,
    });
  }

  const ids = () => [...callbacks.keys()];

  const flush = (id?: number, timestamp = 16) => {
    const nextFrameId = id ?? ids()[0];

    if (!nextFrameId) {
      throw new Error("No animation frame is scheduled.");
    }

    const callback = callbacks.get(nextFrameId);

    if (!callback) {
      throw new Error(`Animation frame ${String(nextFrameId)} was not found.`);
    }

    callbacks.delete(nextFrameId);
    callback(timestamp);
  };

  const flushBatch = (timestamp = 16) => {
    const frameIds = ids();

    for (const frameId of frameIds) {
      if (!callbacks.has(frameId)) {
        continue;
      }

      flush(frameId, timestamp);
    }
  };

  return {
    request,
    cancel,
    ids,
    flush,
    flushBatch,
  };
}
