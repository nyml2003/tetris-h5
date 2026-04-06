import { useEffect, useEffectEvent, useRef } from "react";
import type { Dispatch } from "react";

import {
  INITIAL_GAME_LOOP_CLOCK,
  advanceGameLoop,
} from "@/app/tetrisGameLoop";
import type { AppAction, AppState } from "@/app/tetrisAppState";

export function useTetrisGameLoop(
  state: AppState,
  dispatch: Dispatch<AppAction>
) {
  const clockRef = useRef(INITIAL_GAME_LOOP_CLOCK);

  const advanceFrame = useEffectEvent((timestamp: number) => {
    const { clock, tickCount } = advanceGameLoop(clockRef.current, timestamp, state);
    clockRef.current = clock;

    for (let index = 0; index < tickCount; index += 1) {
      dispatch({ type: "tick" });
    }
  });

  useEffect(() => {
    let frameId = 0;

    const run = (timestamp: number) => {
      advanceFrame(timestamp);
      frameId = window.requestAnimationFrame(run);
    };

    frameId = window.requestAnimationFrame(run);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [advanceFrame]);
}
