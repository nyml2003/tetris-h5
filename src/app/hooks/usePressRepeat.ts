import { useEffect, useRef } from "react";
import type { PointerEventHandler } from "react";

import {
  HOLD_REPEAT_DELAY_MS,
  HOLD_REPEAT_INTERVAL_MS,
} from "@/game/core/constants";

interface UsePressRepeatOptions {
  disabled?: boolean;
  repeat?: boolean;
}

export function usePressRepeat(
  onPress: () => void,
  options: UsePressRepeatOptions = {}
) {
  const { disabled = false, repeat = false } = options;
  const delayRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  function clearTimers() {
    if (delayRef.current !== null) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const handlePointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    onPress();

    if (!repeat) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    delayRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        onPress();
      }, HOLD_REPEAT_INTERVAL_MS);
    }, HOLD_REPEAT_DELAY_MS);
  };

  const handlePointerUp: PointerEventHandler<HTMLButtonElement> = (event) => {
    clearTimers();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    onPointerLeave: repeat ? handlePointerUp : undefined,
  };
}

