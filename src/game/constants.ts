export const BOARD_COLUMNS = 10;
export const BOARD_ROWS = 20;
export const PREVIEW_COLUMNS = 4;
export const PREVIEW_ROWS = 4;
export const LINES_PER_LEVEL = 10;

export const HOLD_REPEAT_DELAY_MS = 170;
export const HOLD_REPEAT_INTERVAL_MS = 72;

export const DROP_INTERVAL_BASE_MS = 860;
export const DROP_INTERVAL_MIN_MS = 120;

export const LINE_CLEAR_SCORES = [0, 100, 300, 500, 800] as const;

export function getDropIntervalMs(level: number): number {
  return Math.max(DROP_INTERVAL_MIN_MS, DROP_INTERVAL_BASE_MS - (level - 1) * 65);
}
