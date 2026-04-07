import { describe, expect, it } from "vitest";

import { createAppState, reduceAppState } from "@/app/tetrisAppState";
import { restartGame } from "@/game/tetrisEngine";

describe("tetrisAppState", () => {
  it("starts a new running manual game from home", () => {
    const nextState = reduceAppState(createAppState(), { type: "start" });

    expect(nextState.playerMode).toBe("manual");
    expect(nextState.screen).toBe("game");
    expect(nextState.game.status).toBe("running");
  });

  it("starts ai mode and preserves it when replaying", () => {
    const startedState = reduceAppState(createAppState(), { type: "startAi" });
    const replayState = reduceAppState(
      {
        ...startedState,
        screen: "result" as const,
        game: {
          ...startedState.game,
          status: "gameOver" as const,
        },
      },
      { type: "playAgain" }
    );

    expect(startedState.playerMode).toBe("ai");
    expect(replayState.playerMode).toBe("ai");
    expect(replayState.screen).toBe("game");
    expect(replayState.game.status).toBe("running");
  });

  it("opens settings from gameplay and resumes when leaving", () => {
    const state = {
      playerMode: "manual" as const,
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

  it("lets an ai round switch to manual control without restarting", () => {
    const startedState = reduceAppState(createAppState(), { type: "startAi" });
    const settingsState = reduceAppState(startedState, {
      type: "openSettings",
      source: "game",
    });
    const takeOverState = reduceAppState(settingsState, { type: "takeOver" });

    expect(settingsState.game.status).toBe("paused");
    expect(takeOverState.playerMode).toBe("manual");
    expect(takeOverState.screen).toBe("game");
    expect(takeOverState.game.status).toBe("running");
    expect(takeOverState.game.score).toBe(settingsState.game.score);
    expect(takeOverState.game.activePiece).toEqual(settingsState.game.activePiece);
  });

  it("routes finished rounds to the result screen and goHome back to home", () => {
    const resultState = reduceAppState(
      {
        playerMode: "manual" as const,
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
    expect(homeState.playerMode).toBe("manual");
    expect(homeState.settingsSource).toBe("home");
  });
});