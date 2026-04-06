export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type GameStatus = "idle" | "running" | "paused" | "gameOver";

export type ControlAction =
  | "left"
  | "right"
  | "rotate"
  | "softDrop"
  | "hardDrop"
  | "pause"
  | "restart";

export type BoardCell = TetrominoType | null;

export type BoardMatrix = BoardCell[][];

export interface GridPoint {
  x: number;
  y: number;
}

export interface ActivePiece extends GridPoint {
  kind: TetrominoType;
  rotation: number;
}

export interface GameState {
  board: BoardMatrix;
  activePiece: ActivePiece;
  nextQueue: TetrominoType[];
  score: number;
  level: number;
  lines: number;
  status: GameStatus;
}
