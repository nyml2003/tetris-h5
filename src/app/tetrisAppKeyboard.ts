import type { ControlAction } from "@/game/types";

import type { AppAction, AppState } from "@/app/tetrisAppState";

const KEY_TO_CONTROL: Record<string, ControlAction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "rotate",
  ArrowDown: "softDrop",
  Space: "hardDrop",
  KeyR: "restart",
};

const BLOCKED_SCROLL_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
]);

export function shouldPreventKeyboardScroll(code: string): boolean {
  return BLOCKED_SCROLL_KEYS.has(code);
}

export function resolveKeyboardAction(
  state: AppState,
  code: string
): AppAction | null {
  if (state.screen === "home") {
    if (code === "Enter") {
      return { type: "start" };
    }

    if (code === "KeyH") {
      return { type: "openHelp" };
    }

    if (code === "Escape") {
      return { type: "goHome" };
    }

    return null;
  }

  if (state.screen === "help") {
    if (code === "Enter") {
      return { type: "start" };
    }

    if (code === "KeyA") {
      return { type: "startAi" };
    }

    if (code === "Escape") {
      return { type: "goHome" };
    }

    return null;
  }

  if (state.screen === "settings") {
    if (code === "Escape" || code === "Enter") {
      return { type: "leaveSettings" };
    }

    if (code === "KeyR") {
      return { type: "playAgain" };
    }

    return null;
  }

  if (state.screen === "result") {
    if (code === "Enter") {
      return { type: "playAgain" };
    }

    if (code === "Escape") {
      return { type: "goHome" };
    }

    return null;
  }

  if (code === "Escape" || code === "KeyP") {
    return { type: "openSettings", source: "game" };
  }

  const control = KEY_TO_CONTROL[code];

  if (!control) {
    return null;
  }

  if (control === "restart") {
    return { type: "playAgain" };
  }

  if (state.playerMode === "ai") {
    return null;
  }

  return { type: "control", control };
}
