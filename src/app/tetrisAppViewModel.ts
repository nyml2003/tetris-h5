import type { GameState, TetrominoType } from "@/game/types";

import type { AppState } from "@/app/tetrisAppState";

interface SummaryCopy {
  hud: {
    level: string;
    lines: string;
    score: string;
  };
}

export function selectNextPiece(state: AppState): TetrominoType | null {
  return state.game.nextQueue[0] ?? null;
}

export function selectIsGameScreen(state: AppState): boolean {
  return state.screen === "game";
}

export function selectIsPlayable(state: AppState): boolean {
  return selectIsGameScreen(state) && state.game.status === "running";
}

export function selectSettingsFromGame(state: AppState): boolean {
  return state.screen === "settings" && state.settingsSource === "game";
}

export function createSummaryStats(game: GameState, copy: SummaryCopy) {
  return [
    { label: copy.hud.score, value: String(game.score) },
    { label: copy.hud.lines, value: String(game.lines) },
    { label: copy.hud.level, value: String(game.level) },
  ] as const;
}
