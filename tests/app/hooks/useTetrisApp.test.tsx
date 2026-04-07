import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { useTetrisApp, type AppState } from "@/app/hooks/useTetrisApp";

import { installRafMock } from "../../utils/browser";
import { renderHook } from "../../utils/renderHarness";

function dispatchKey(code: string, cancelable = false) {
  const event = new KeyboardEvent("keydown", { cancelable, code });

  act(() => {
    window.dispatchEvent(event);
  });

  return event;
}

interface AppHistoryEntry {
  appState: AppState;
}

describe("useTetrisApp", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("hydrates the help page when the current path is /help", () => {
    installRafMock();
    window.history.replaceState(null, "", "/help");

    const hook = renderHook(() => useTetrisApp());

    expect(hook.current.screen).toBe("help");
    expect(hook.current.helpPage).toBe(0);
    expect(window.location.pathname).toBe("/help");
  });

  it("hydrates a new game when the current path is /play", () => {
    installRafMock();
    window.history.replaceState(null, "", "/play");

    const hook = renderHook(() => useTetrisApp());

    expect(hook.current.screen).toBe("game");
    expect(hook.current.isPlayable).toBe(true);
    expect(window.location.pathname).toBe("/play");
  });

  it("handles home, help, game, and settings keyboard flows", () => {
    installRafMock();
    const hook = renderHook(() => useTetrisApp());

    expect(hook.current.screen).toBe("home");
    expect(hook.current.isPlayable).toBe(false);
    expect(window.location.pathname).toBe("/");

    dispatchKey("KeyH");
    expect(hook.current.screen).toBe("help");
    expect(window.location.pathname).toBe("/help");

    dispatchKey("Escape");
    expect(hook.current.screen).toBe("home");
    expect(window.location.pathname).toBe("/");

    dispatchKey("Enter");
    expect(hook.current.screen).toBe("game");
    expect(hook.current.isPlayable).toBe(true);
    expect(window.location.pathname).toBe("/play");

    const startY = hook.current.gameState.activePiece.y;
    const dropEvent = dispatchKey("ArrowDown", true);

    expect(dropEvent.defaultPrevented).toBe(true);
    expect(hook.current.gameState.activePiece.y).toBe(startY + 1);
    expect(hook.current.gameState.score).toBe(1);

    dispatchKey("Escape");
    expect(hook.current.screen).toBe("settings");
    expect(hook.current.settingsFromGame).toBe(true);
    expect(hook.current.gameState.status).toBe("paused");
    expect(window.location.pathname).toBe("/play");

    dispatchKey("Enter");
    expect(hook.current.screen).toBe("game");
    expect(hook.current.gameState.status).toBe("running");
    expect(window.location.pathname).toBe("/play");

    dispatchKey("KeyR");
    expect(hook.current.screen).toBe("game");
    expect(hook.current.gameState.score).toBe(0);
    expect(window.location.pathname).toBe("/play");
  });

  it("tracks help-page pagination and route state", () => {
    installRafMock();
    const hook = renderHook(() => useTetrisApp());

    act(() => {
      hook.current.openHelp();
    });

    expect(hook.current.screen).toBe("help");
    expect(window.location.pathname).toBe("/help");

    act(() => {
      hook.current.setHelpPage(1);
    });

    const historyState = window.history.state as AppHistoryEntry;

    expect(hook.current.helpPage).toBe(1);
    expect(historyState.appState.helpPage).toBe(1);
  });

  it("advances frames only while the game is actively running", () => {
    const raf = installRafMock();
    const hook = renderHook(() => useTetrisApp());

    act(() => {
      hook.current.startGame();
    });

    const initialY = hook.current.gameState.activePiece.y;

    act(() => {
      raf.flush(raf.ids()[0], 0);
    });
    act(() => {
      raf.flush(raf.ids()[0], 900);
    });

    expect(hook.current.gameState.activePiece.y).toBe(initialY + 1);

    act(() => {
      hook.current.openGameSettings();
    });

    const pausedY = hook.current.gameState.activePiece.y;

    act(() => {
      raf.flush(raf.ids()[0], 1800);
    });

    expect(hook.current.gameState.activePiece.y).toBe(pausedY);

    const pendingFrameId = raf.ids()[0];
    hook.unmount();

    expect(raf.cancel).toHaveBeenCalledWith(pendingFrameId);
  });

  it("starts ai mode, locks manual movement, and lets autoplay advance the round", () => {
    const raf = installRafMock();
    const hook = renderHook(() => useTetrisApp());

    act(() => {
      hook.current.startAi();
    });

    expect(hook.current.screen).toBe("game");
    expect(hook.current.playerMode).toBe("ai");
    expect(hook.current.isAiMode).toBe(true);
    expect(hook.current.controlsDisabled).toBe(true);
    expect(hook.current.gameModeBadge).not.toBeNull();
    expect(hook.current.gameHint).toBe(hook.current.copy.game.aiHint);
    expect(hook.current.settingsItems.at(-1)?.value).toBe(
      hook.current.copy.settings.aiMode
    );
    expect(window.location.pathname).toBe("/play");

    const initialPiece = { ...hook.current.gameState.activePiece };
    dispatchKey("ArrowLeft", true);
    expect(hook.current.gameState.activePiece).toEqual(initialPiece);

    for (let index = 0; index < 4; index += 1) {
      act(() => {
        raf.flushBatch((index + 1) * 16);
      });
    }

    expect(hook.current.gameState.score).toBeGreaterThan(0);

    act(() => {
      hook.current.openGameSettings();
    });

    const pausedScore = hook.current.gameState.score;

    act(() => {
      raf.flushBatch(96);
    });

    expect(hook.current.screen).toBe("settings");
    expect(hook.current.gameState.score).toBe(pausedScore);
  });

  it("lets the player take over an ai round from paused settings", () => {
    installRafMock();
    const hook = renderHook(() => useTetrisApp());

    act(() => {
      hook.current.startAi();
    });

    const manualStartX = hook.current.gameState.activePiece.x;

    act(() => {
      hook.current.openGameSettings();
    });

    expect(hook.current.screen).toBe("settings");
    expect(hook.current.playerMode).toBe("ai");
    expect(hook.current.gameState.status).toBe("paused");

    act(() => {
      hook.current.takeOver();
    });

    expect(hook.current.screen).toBe("game");
    expect(hook.current.playerMode).toBe("manual");
    expect(hook.current.isAiMode).toBe(false);
    expect(hook.current.controlsDisabled).toBe(false);
    expect(hook.current.gameState.status).toBe("running");
    expect(hook.current.gameHint).toBe(hook.current.copy.game.keyboard);
    expect(hook.current.gameModeBadge).toBeNull();

    dispatchKey("ArrowLeft", true);
    expect(hook.current.gameState.activePiece.x).toBe(manualStartX - 1);
  });

  it("syncs route changes and restores screen state on popstate", () => {
    installRafMock();
    const hook = renderHook(() => useTetrisApp());

    act(() => {
      hook.current.openHelp();
      hook.current.setHelpPage(1);
    });

    const helpEntry = window.history.state as AppHistoryEntry;

    act(() => {
      hook.current.goHome();
    });

    expect(hook.current.screen).toBe("home");
    expect(window.location.pathname).toBe("/");

    act(() => {
      window.history.replaceState(helpEntry, "", "/help");
      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: helpEntry,
        })
      );
    });

    expect(hook.current.screen).toBe("help");
    expect(hook.current.helpPage).toBe(1);
    expect(window.location.pathname).toBe("/help");
  });
});

