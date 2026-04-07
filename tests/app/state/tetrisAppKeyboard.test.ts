import { describe, expect, it } from "vitest";

import {
  resolveKeyboardAction,
  shouldPreventKeyboardScroll,
} from "@/app/state/tetrisAppKeyboard";
import { createAppState } from "@/app/state/tetrisAppState";
import { restartGame } from "@/game/core/tetrisEngine";

describe("tetrisAppKeyboard", () => {
  it("flags only gameplay movement keys for scroll prevention", () => {
    expect(shouldPreventKeyboardScroll("ArrowDown")).toBe(true);
    expect(shouldPreventKeyboardScroll("Space")).toBe(true);
    expect(shouldPreventKeyboardScroll("KeyH")).toBe(false);
  });

  it("maps home, help, and settings screen keys to app actions", () => {
    const homeState = createAppState();
    const helpState = {
      ...createAppState(),
      screen: "help" as const,
    };
    const settingsState = {
      ...homeState,
      screen: "settings" as const,
      settingsSource: "game" as const,
      game: {
        ...restartGame(["T", "O", "I"]),
        status: "paused" as const,
      },
    };

    expect(resolveKeyboardAction(homeState, "Enter")).toEqual({ type: "start" });
    expect(resolveKeyboardAction(homeState, "KeyH")).toEqual({ type: "openHelp" });
    expect(resolveKeyboardAction(helpState, "Enter")).toEqual({ type: "start" });
    expect(resolveKeyboardAction(helpState, "KeyA")).toEqual({ type: "startAi" });
    expect(resolveKeyboardAction(helpState, "Escape")).toEqual({
      type: "goHome",
    });
    expect(resolveKeyboardAction(settingsState, "Escape")).toEqual({
      type: "leaveSettings",
    });
    expect(resolveKeyboardAction(settingsState, "KeyR")).toEqual({
      type: "playAgain",
    });
  });

  it("maps result and gameplay keys to the right transitions", () => {
    const runningState = {
      playerMode: "manual" as const,
      screen: "game" as const,
      settingsSource: "home" as const,
      helpPage: 0,
      game: restartGame(["T", "O", "I"]),
    };
    const resultState = {
      ...runningState,
      screen: "result" as const,
      game: {
        ...runningState.game,
        status: "gameOver" as const,
      },
    };

    expect(resolveKeyboardAction(resultState, "Enter")).toEqual({
      type: "playAgain",
    });
    expect(resolveKeyboardAction(resultState, "Escape")).toEqual({
      type: "goHome",
    });
    expect(resolveKeyboardAction(runningState, "Escape")).toEqual({
      type: "openSettings",
      source: "game",
    });
    expect(resolveKeyboardAction(runningState, "ArrowLeft")).toEqual({
      type: "control",
      control: "left",
    });
    expect(resolveKeyboardAction(runningState, "KeyR")).toEqual({
      type: "playAgain",
    });
    expect(resolveKeyboardAction(runningState, "KeyQ")).toBeNull();
  });

  it("blocks manual movement keys while ai mode is active", () => {
    const aiState = {
      playerMode: "ai" as const,
      screen: "game" as const,
      settingsSource: "home" as const,
      helpPage: 0,
      game: restartGame(["T", "O", "I"]),
    };

    expect(resolveKeyboardAction(aiState, "ArrowLeft")).toBeNull();
    expect(resolveKeyboardAction(aiState, "ArrowUp")).toBeNull();
    expect(resolveKeyboardAction(aiState, "Escape")).toEqual({
      type: "openSettings",
      source: "game",
    });
    expect(resolveKeyboardAction(aiState, "KeyR")).toEqual({
      type: "playAgain",
    });
  });
});

