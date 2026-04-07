import type { GameState, TetrominoType } from "@/game/core/types";

import type { AppState } from "@/app/state/types";

// These copy shapes stay narrow on purpose, so selector tests can provide only
// the text they actually render instead of the full resource table.
interface SummaryCopy {
  hud: {
    level: string;
    lines: string;
    score: string;
  };
}

interface GameCopy {
  game: {
    aiBadge: string;
    aiHint: string;
    keyboard: string;
  };
}

interface SettingsCopy {
  settings: {
    aiMode: string;
    items: readonly { label: string; value: string }[];
    manualMode: string;
    mode: string;
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

export function selectIsAiMode(state: AppState): boolean {
  return state.playerMode === "ai";
}

export function selectControlsDisabled(state: AppState): boolean {
  return !selectIsPlayable(state) || selectIsAiMode(state);
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

export function selectGameHint(state: AppState, copy: GameCopy): string {
  return selectIsAiMode(state) ? copy.game.aiHint : copy.game.keyboard;
}

export function selectGameModeBadge(
  state: AppState,
  copy: GameCopy
): string | null {
  return selectIsAiMode(state) ? copy.game.aiBadge : null;
}

export function createSettingsItems(
  state: AppState,
  copy: SettingsCopy
) {
  return [
    ...copy.settings.items,
    {
      label: copy.settings.mode,
      value: state.playerMode === "ai" ? copy.settings.aiMode : copy.settings.manualMode,
    },
  ] as const;
}

