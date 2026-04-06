import { describe, expect, it } from "vitest";

import {
  INITIAL_GAME_LOOP_CLOCK,
  advanceGameLoop,
} from "@/app/tetrisGameLoop";
import { restartGame } from "@/game/tetrisEngine";

describe("tetrisGameLoop", () => {
  it("initializes the first running frame without dispatching ticks", () => {
    const state = {
      screen: "game" as const,
      settingsSource: "home" as const,
      game: restartGame(["T", "O", "I"]),
    };

    const result = advanceGameLoop(INITIAL_GAME_LOOP_CLOCK, 120, state);

    expect(result.tickCount).toBe(0);
    expect(result.clock.lastFrame).toBe(120);
    expect(result.clock.elapsed).toBe(0);
  });

  it("accumulates elapsed time into gameplay ticks", () => {
    const state = {
      screen: "game" as const,
      settingsSource: "home" as const,
      game: restartGame(["T", "O", "I"]),
    };

    const result = advanceGameLoop(
      {
        elapsed: 0,
        lastFrame: 0,
      },
      900,
      state
    );

    expect(result.tickCount).toBe(1);
    expect(result.clock.elapsed).toBe(40);
  });

  it("resets the loop clock when the round is not actively running", () => {
    const state = {
      screen: "settings" as const,
      settingsSource: "game" as const,
      game: {
        ...restartGame(["T", "O", "I"]),
        status: "paused" as const,
      },
    };

    const result = advanceGameLoop(
      {
        elapsed: 450,
        lastFrame: 200,
      },
      600,
      state
    );

    expect(result.tickCount).toBe(0);
    expect(result.clock.lastFrame).toBe(600);
    expect(result.clock.elapsed).toBe(0);
  });
});
