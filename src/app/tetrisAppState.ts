import {
  applyAction,
  beginGame,
  createGameState,
  restartGame,
  stepGame,
  togglePause,
} from "@/game/tetrisEngine";
import type { ControlAction, GameState } from "@/game/types";

export type AppScreen = "home" | "help" | "game" | "settings" | "result";
export type PlayerMode = "manual" | "ai";
export type SettingsSource = "home" | "game";

export interface AppState {
  playerMode: PlayerMode;
  screen: AppScreen;
  settingsSource: SettingsSource;
  helpPage: number;
  game: GameState;
}

export type AppAction =
  | { type: "start" }
  | { type: "startAi" }
  | { type: "openHelp" }
  | { type: "setHelpPage"; page: number }
  | { type: "tick" }
  | { type: "control"; control: ControlAction }
  | { type: "openSettings"; source: SettingsSource }
  | { type: "leaveSettings" }
  | { type: "takeOver" }
  | { type: "playAgain" }
  | { type: "goHome" }
  | { type: "restore"; state: AppState };

export function createAppState(): AppState {
  return {
    playerMode: "manual",
    screen: "home",
    settingsSource: "home",
    helpPage: 0,
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
        playerMode: "manual",
        screen: "game",
        settingsSource: "home",
        helpPage: 0,
        game: restartGame(),
      };
    case "startAi":
      return {
        playerMode: "ai",
        screen: "game",
        settingsSource: "home",
        helpPage: 0,
        game: restartGame(),
      };
    case "openHelp":
      return {
        ...state,
        screen: "help",
        helpPage: 0,
      };
    case "setHelpPage":
      return state.screen === "help"
        ? {
            ...state,
            helpPage: Math.max(0, action.page),
          }
        : state;
    case "tick":
      return finalizeGameScreen(state, stepGame(state.game));
    case "control":
      return finalizeGameScreen(state, applyAction(state.game, action.control));
    case "openSettings":
      return {
        ...state,
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
    case "takeOver":
      return state.screen === "settings" && state.settingsSource === "game"
        ? {
            ...state,
            playerMode: "manual",
            screen: "game",
            game: beginGame(state.game),
          }
        : state;
    case "playAgain":
      return {
        playerMode: state.playerMode,
        screen: "game",
        settingsSource: "home",
        helpPage: 0,
        game: restartGame(),
      };
    case "goHome":
      return createAppState();
    case "restore":
      return action.state;
    default:
      return state;
  }
}
