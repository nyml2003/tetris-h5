import type { ActivePiece, GridPoint, TetrominoType } from "@/game/core/types";

type RotationShape = readonly GridPoint[];

const I_SHAPE = [
  [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ],
  [
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 2, y: 3 },
  ],
  [
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
  ],
  [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
  ],
] as const satisfies readonly RotationShape[];

const O_SHAPE = [
  [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
] as const satisfies readonly RotationShape[];

const T_SHAPE = [
  [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
  ],
] as const satisfies readonly RotationShape[];

const S_SHAPE = [
  [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
  ],
  [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
  ],
] as const satisfies readonly RotationShape[];

const Z_SHAPE = [
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  [
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
  ],
  [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
  ],
] as const satisfies readonly RotationShape[];

const J_SHAPE = [
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
  ],
  [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
  ],
  [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
] as const satisfies readonly RotationShape[];

const L_SHAPE = [
  [
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ],
  [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
  ],
  [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
  ],
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
  ],
] as const satisfies readonly RotationShape[];

const ROTATION_MAP: Record<TetrominoType, readonly RotationShape[]> = {
  I: I_SHAPE,
  O: O_SHAPE,
  T: T_SHAPE,
  S: S_SHAPE,
  Z: Z_SHAPE,
  J: J_SHAPE,
  L: L_SHAPE,
};

export const PIECE_COLORS: Record<TetrominoType, string> = {
  I: "#7dd3c7",
  O: "#facc15",
  T: "#fb7185",
  S: "#4ade80",
  Z: "#f97316",
  J: "#60a5fa",
  L: "#f59e0b",
};

export const TETROMINO_ORDER: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export function getRotationCells(
  kind: TetrominoType,
  rotation: number
): readonly GridPoint[] {
  return ROTATION_MAP[kind][((rotation % 4) + 4) % 4];
}

export function getPieceCells(piece: ActivePiece): GridPoint[] {
  return getRotationCells(piece.kind, piece.rotation).map((cell) => ({
    x: piece.x + cell.x,
    y: piece.y + cell.y,
  }));
}

export function createSpawnPiece(kind: TetrominoType): ActivePiece {
  return {
    kind,
    rotation: 0,
    x: 3,
    y: -1,
  };
}

export function createShuffledBag(): TetrominoType[] {
  const bag = [...TETROMINO_ORDER];

  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const next = bag[index];
    bag[index] = bag[swapIndex];
    bag[swapIndex] = next;
  }

  return bag;
}

