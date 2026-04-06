import { getDropIntervalMs } from "@/game/constants";

import type { AppState } from "@/app/tetrisAppState";

export interface GameLoopClock {
  elapsed: number;
  lastFrame: number | null;
}

export const INITIAL_GAME_LOOP_CLOCK: GameLoopClock = {
  elapsed: 0,
  lastFrame: null,
};

export function advanceGameLoop(
  clock: GameLoopClock,
  timestamp: number,
  state: AppState
) {
  const previousFrame = clock.lastFrame ?? timestamp;
  const delta = timestamp - previousFrame;

  if (state.screen !== "game" || state.game.status !== "running") {
    return {
      clock: {
        elapsed: 0,
        lastFrame: timestamp,
      },
      tickCount: 0,
    };
  }

  let elapsed = clock.elapsed + delta;
  let tickCount = 0;
  const dropInterval = getDropIntervalMs(state.game.level);

  while (elapsed >= dropInterval) {
    elapsed -= dropInterval;
    tickCount += 1;
  }

  return {
    clock: {
      elapsed,
      lastFrame: timestamp,
    },
    tickCount,
  };
}
