import { describe, expect, it } from "vitest";

import { createAppState, reduceAppState } from "@/app/tetrisAppState";
import { restartGame } from "@/game/tetrisEngine";

describe("tetrisAppState", () => {
  it("starts a new running game from home", () => {
    const nextState = reduceAppState(createAppState(), { type: "start" });

    expect(nextState.screen).toBe("game");
    expect(nextState.game.status).toBe("running");
  });

  it("opens settings from gameplay and resumes when leaving", () => {
    const state = {
      screen: "game" as const,
      settingsSource: "home" as const,
      game: restartGame(["T", "O", "I"]),
    };

    const settingsState = reduceAppState(state, {
      type: "openSettings",
      source: "game",
    });
    const resumedState = reduceAppState(settingsState, { type: "leaveSettings" });

    expect(settingsState.screen).toBe("settings");
    expect(settingsState.game.status).toBe("paused");
    expect(resumedState.screen).toBe("game");
    expect(resumedState.game.status).toBe("running");
  });

  it("routes finished rounds to the result screen and goHome back to home", () => {
    const resultState = reduceAppState(
      {
        screen: "game" as const,
        settingsSource: "home" as const,
        game: {
          ...restartGame(["T", "O", "I"]),
          status: "gameOver" as const,
        },
      },
      { type: "tick" }
    );

    const homeState = reduceAppState(resultState, { type: "goHome" });

    expect(resultState.screen).toBe("result");
    expect(homeState.screen).toBe("home");
    expect(homeState.settingsSource).toBe("home");
  });
});
