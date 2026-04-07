import type { ControlAction, GameState } from "@/game/core/types";

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
