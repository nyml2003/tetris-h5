import {
  applyAction,
  beginGame,
  createGameState,
  restartGame,
  stepGame,
  togglePause,
} from "@/game/tetrisEngine";
import type { ControlAction, GameState } from "@/game/types";

export type AppScreen = "home" | "game" | "settings" | "result";
export type SettingsSource = "home" | "game";

export interface AppState {
  screen: AppScreen;
  settingsSource: SettingsSource;
  game: GameState;
}

export type AppAction =
  | { type: "start" }
  | { type: "tick" }
  | { type: "control"; control: ControlAction }
  | { type: "openSettings"; source: SettingsSource }
  | { type: "leaveSettings" }
  | { type: "playAgain" }
  | { type: "goHome" };

export function createAppState(): AppState {
  return {
    screen: "home",
    settingsSource: "home",
    game: createGameState(),
  };
}

function finalizeGameScreen(state: AppState, game: GameState): AppState {
  if (game.status === "gameOver") {
    return {
      ...state,
      game,
      screen: "result",
    };
  }

  return {
    ...state,
    game,
  };
}

export function reduceAppState(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "start":
      return {
        screen: "game",
        settingsSource: "home",
        game: restartGame(),
      };
    case "tick":
      return finalizeGameScreen(state, stepGame(state.game));
    case "control":
      return finalizeGameScreen(state, applyAction(state.game, action.control));
    case "openSettings":
      return {
        screen: "settings",
        settingsSource: action.source,
        game:
          action.source === "game" && state.game.status === "running"
            ? togglePause(state.game)
            : state.game,
      };
    case "leaveSettings":
      return state.settingsSource === "game"
        ? {
            ...state,
            screen: "game",
            game: beginGame(state.game),
          }
        : {
            ...state,
            screen: "home",
          };
    case "playAgain":
      return {
        screen: "game",
        settingsSource: "home",
        game: restartGame(),
      };
    case "goHome":
      return createAppState();
    default:
      return state;
  }
}
