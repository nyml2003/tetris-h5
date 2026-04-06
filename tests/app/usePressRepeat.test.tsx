import { describe, expect, it, vi } from "vitest";

import { usePressRepeat } from "@/app/usePressRepeat";
import {
  HOLD_REPEAT_DELAY_MS,
  HOLD_REPEAT_INTERVAL_MS,
} from "@/game/constants";

import { renderHook } from "../utils/renderHarness";

type PressBindings = ReturnType<typeof usePressRepeat>;
type PointerEventArg = Parameters<PressBindings["onPointerDown"]>[0];

function createPointerEvent(hasCapture = true) {
  return {
    currentTarget: {
      hasPointerCapture: vi.fn(() => hasCapture),
      releasePointerCapture: vi.fn(),
      setPointerCapture: vi.fn(),
    },
    pointerId: 7,
    preventDefault: vi.fn(),
  };
}

describe("usePressRepeat", () => {
  it("fires immediately, repeats after the hold delay, and releases capture", () => {
    vi.useFakeTimers();

    const onPress = vi.fn();
    const hook = renderHook(() => usePressRepeat(onPress, { repeat: true }));
    const event = createPointerEvent();

    hook.current.onPointerDown(event as unknown as PointerEventArg);
    vi.advanceTimersByTime(HOLD_REPEAT_DELAY_MS + HOLD_REPEAT_INTERVAL_MS * 2);
    hook.current.onPointerUp(event as unknown as PointerEventArg);
    vi.advanceTimersByTime(HOLD_REPEAT_INTERVAL_MS * 2);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(7);
    expect(onPress).toHaveBeenCalledTimes(3);
    expect(event.currentTarget.releasePointerCapture).toHaveBeenCalledWith(7);
  });

  it("skips repeat behavior when disabled or configured for single taps", () => {
    const disabledPress = vi.fn();
    const disabledHook = renderHook(() =>
      usePressRepeat(disabledPress, { disabled: true, repeat: true })
    );

    const disabledEvent = createPointerEvent();

    disabledHook.current.onPointerDown(disabledEvent as unknown as PointerEventArg);

    expect(disabledPress).not.toHaveBeenCalled();
    expect(disabledEvent.preventDefault).not.toHaveBeenCalled();

    const singleTapPress = vi.fn();
    const singleTapHook = renderHook(() => usePressRepeat(singleTapPress));
    const singleTapEvent = createPointerEvent(false);

    singleTapHook.current.onPointerDown(singleTapEvent as unknown as PointerEventArg);

    expect(singleTapPress).toHaveBeenCalledOnce();
    expect(singleTapHook.current.onPointerLeave).toBeUndefined();
    expect(singleTapEvent.currentTarget.setPointerCapture).not.toHaveBeenCalled();
  });

  it("clears pending timers when the hook unmounts", () => {
    vi.useFakeTimers();

    const onPress = vi.fn();
    const hook = renderHook(() => usePressRepeat(onPress, { repeat: true }));

    hook.current.onPointerDown(createPointerEvent() as unknown as PointerEventArg);
    hook.unmount();
    vi.advanceTimersByTime(HOLD_REPEAT_DELAY_MS + HOLD_REPEAT_INTERVAL_MS * 3);

    expect(onPress).toHaveBeenCalledOnce();
  });
});
