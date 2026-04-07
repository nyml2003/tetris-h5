import { createAppState, type AppState } from "@/app/tetrisAppState";
import { restartGame } from "@/game/tetrisEngine";
import type { GameState } from "@/game/types";

export const HOME_ROUTE = "/";
export const HELP_ROUTE = "/help";
export const PLAY_ROUTE = "/play";
export const RESULT_ROUTE = "/result";

interface AppHistoryState {
  appState: AppState;
}

function normalizePathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "");

  return normalized === "" ? HOME_ROUTE : normalized;
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GameState>;

  return (
    Array.isArray(candidate.board) &&
    candidate.board.every((row) => Array.isArray(row)) &&
    candidate.activePiece !== undefined &&
    Array.isArray(candidate.nextQueue) &&
    typeof candidate.score === "number" &&
    typeof candidate.level === "number" &&
    typeof candidate.lines === "number" &&
    (candidate.status === "idle" ||
      candidate.status === "running" ||
      candidate.status === "paused" ||
      candidate.status === "gameOver")
  );
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AppState>;

  return (
    (candidate.playerMode === "manual" || candidate.playerMode === "ai") &&
    (candidate.screen === "home" ||
      candidate.screen === "help" ||
      candidate.screen === "game" ||
      candidate.screen === "settings" ||
      candidate.screen === "result") &&
    (candidate.settingsSource === "home" || candidate.settingsSource === "game") &&
    typeof candidate.helpPage === "number" &&
    candidate.helpPage >= 0 &&
    isGameState(candidate.game)
  );
}

function readHistoryAppState(historyState: unknown): AppState | null {
  if (!historyState || typeof historyState !== "object") {
    return null;
  }

  const candidate = historyState as Partial<AppHistoryState>;

  return isAppState(candidate.appState) ? candidate.appState : null;
}

function createPlayState(): AppState {
  return {
    playerMode: "manual",
    screen: "game",
    settingsSource: "home",
    helpPage: 0,
    game: restartGame(),
  };
}

function createHelpState(): AppState {
  return {
    ...createAppState(),
    screen: "help",
  };
}

export function createInitialAppRouteState(): AppState {
  if (typeof window === "undefined") {
    return createAppState();
  }

  return resolveAppRouteState(window.location.pathname, window.history.state);
}

export function resolveAppRouteState(
  pathname: string,
  historyState: unknown
): AppState {
  const restoredState = readHistoryAppState(historyState);

  if (restoredState) {
    return restoredState;
  }

  switch (normalizePathname(pathname)) {
    case HELP_ROUTE:
      return createHelpState();
    case PLAY_ROUTE:
      return createPlayState();
    default:
      return createAppState();
  }
}

export function getRoutePathForState(state: AppState): string {
  switch (state.screen) {
    case "help":
      return HELP_ROUTE;
    case "game":
    case "settings":
      return PLAY_ROUTE;
    case "result":
      return RESULT_ROUTE;
    case "home":
    default:
      return HOME_ROUTE;
  }
}

export function createAppHistoryState(state: AppState): AppHistoryState {
  return {
    appState: state,
  };
}
