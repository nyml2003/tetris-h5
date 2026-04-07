import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { useCanvasSurface } from "@/app/hooks/useCanvasSurface";

import { ResizeObserverMock, emitResize } from "../../utils/browser";
import { renderElement } from "../../utils/renderHarness";

function installImmediateRaf() {
  let nextId = 0;
  const request = vi.fn((callback: FrameRequestCallback) => {
    nextId += 1;
    callback(nextId * 16);
    return nextId;
  });
  const cancel = vi.fn();

  vi.stubGlobal("requestAnimationFrame", request);
  vi.stubGlobal("cancelAnimationFrame", cancel);
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: request,
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    value: cancel,
  });

  return { cancel, request };
}

function installQueuedRaf() {
  let nextId = 0;
  const request = vi.fn((callback: FrameRequestCallback) => {
    void callback;
    nextId += 1;
    return nextId;
  });
  const cancel = vi.fn();

  vi.stubGlobal("requestAnimationFrame", request);
  vi.stubGlobal("cancelAnimationFrame", cancel);
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: request,
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    value: cancel,
  });

  return { cancel, request };
}

describe("useCanvasSurface", () => {
  it("draws on mount and redraws when the value or canvas size changes", () => {
    installImmediateRaf();
    ResizeObserverMock.install();
    const draw = vi.fn();

    function Harness(props: { value: string }) {
      const ref = useCanvasSurface(props.value, draw);
      return <canvas ref={ref} />;
    }

    const rendered = renderElement(<Harness value="alpha" />);
    const canvas = rendered.container.firstElementChild as HTMLCanvasElement;

    expect(draw).toHaveBeenCalledWith(canvas, "alpha");

    rendered.rerender(<Harness value="beta" />);
    expect(draw).toHaveBeenLastCalledWith(canvas, "beta");

    act(() => {
      emitResize(canvas);
    });

    expect(draw).toHaveBeenLastCalledWith(canvas, "beta");
  });

  it("cancels queued frames when a new draw is requested and on unmount", () => {
    const raf = installQueuedRaf();
    ResizeObserverMock.install();
    const draw = vi.fn();

    function Harness(props: { value: string }) {
      const ref = useCanvasSurface(props.value, draw);
      return <canvas ref={ref} />;
    }

    const rendered = renderElement(<Harness value="alpha" />);
    const canvas = rendered.container.firstElementChild as HTMLCanvasElement;

    expect(raf.request).toHaveBeenCalledTimes(1);

    rendered.rerender(<Harness value="beta" />);

    expect(raf.cancel).toHaveBeenCalledWith(1);
    expect(raf.request.mock.calls.length).toBeGreaterThan(1);

    const requestCountBeforeResize = raf.request.mock.calls.length;

    act(() => {
      emitResize(canvas);
    });

    expect(raf.cancel).toHaveBeenCalledWith(2);
    expect(raf.request.mock.calls.length).toBeGreaterThan(requestCountBeforeResize);

    const latestResult = raf.request.mock.results.at(-1);

    if (!latestResult || typeof latestResult.value !== "number") {
      throw new Error("Latest requestAnimationFrame id was not captured.");
    }

    const latestRequestId = latestResult.value;
    const observer = ResizeObserverMock.instances[0];
    rendered.unmount();

    expect(observer?.disconnect).toHaveBeenCalledOnce();
    expect(raf.cancel).toHaveBeenCalledWith(latestRequestId);
    expect(draw).not.toHaveBeenCalled();
  });
});

