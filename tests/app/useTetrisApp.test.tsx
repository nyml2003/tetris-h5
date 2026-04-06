import { act } from "react";
import { describe, expect, it } from "vitest";

import { useTetrisApp } from "@/app/useTetrisApp";

import { installRafMock } from "../utils/browser";
import { renderHook } from "../utils/renderHarness";

function dispatchKey(code: string, cancelable = false) {
  const event = new KeyboardEvent("keydown", { cancelable, code });

  act(() => {
    window.dispatchEvent(event);
  });

  return event;
}

describe("useTetrisApp", () => {
  it("handles home, game, and settings keyboard flows", () => {
    installRafMock();
    const hook = renderHook(() => useTetrisApp());

    expect(hook.current.screen).toBe("home");
    expect(hook.current.isPlayable).toBe(false);

    dispatchKey("KeyS");
    expect(hook.current.screen).toBe("settings");
    expect(hook.current.settingsSource).toBe("home");

    dispatchKey("Enter");
    expect(hook.current.screen).toBe("home");

    dispatchKey("Enter");
    expect(hook.current.screen).toBe("game");
    expect(hook.current.isPlayable).toBe(true);

    const startY = hook.current.gameState.activePiece.y;
    const dropEvent = dispatchKey("ArrowDown", true);

    expect(dropEvent.defaultPrevented).toBe(true);
    expect(hook.current.gameState.activePiece.y).toBe(startY + 1);
    expect(hook.current.gameState.score).toBe(1);

    dispatchKey("Escape");
    expect(hook.current.screen).toBe("settings");
    expect(hook.current.settingsFromGame).toBe(true);
    expect(hook.current.gameState.status).toBe("paused");

    dispatchKey("Enter");
    expect(hook.current.screen).toBe("game");
    expect(hook.current.gameState.status).toBe("running");

    dispatchKey("KeyR");
    expect(hook.current.screen).toBe("game");
    expect(hook.current.gameState.score).toBe(0);
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
});
