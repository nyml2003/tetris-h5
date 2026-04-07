import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  LINE_CLEAR_SCORES,
  LINES_PER_LEVEL,
} from "@/game/core/constants";
import {
  createShuffledBag,
  createSpawnPiece,
  getPieceCells,
} from "@/game/core/pieces";
import type {
  ActivePiece,
  BoardMatrix,
  ControlAction,
  GameState,
  TetrominoType,
} from "@/game/core/types";

const ROTATION_KICKS = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -2, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: -1 },
];

export function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLUMNS }, () => null)
  );
}

function cloneBoard(board: BoardMatrix): BoardMatrix {
  return board.map((row) => [...row]);
}

function refillQueue(queue: TetrominoType[]): TetrominoType[] {
  const nextQueue = [...queue];

  while (nextQueue.length < 7) {
    nextQueue.push(...createShuffledBag());
  }

  return nextQueue;
}

function drawNextPiece(queue: TetrominoType[]) {
  const fullQueue = refillQueue(queue);
  const [kind, ...rest] = fullQueue;

  return {
    activePiece: createSpawnPiece(kind),
    nextQueue: refillQueue(rest),
  };
}

function computeLevel(lines: number): number {
  return Math.floor(lines / LINES_PER_LEVEL) + 1;
}

function mergePieceIntoBoard(board: BoardMatrix, piece: ActivePiece) {
  const nextBoard = cloneBoard(board);
  let toppedOut = false;

  // A locked piece may still occupy hidden spawn rows. Those cells are ignored
  // on the board matrix, but we keep the information to trigger game over.
  for (const cell of getPieceCells(piece)) {
    if (cell.y < 0) {
      toppedOut = true;
      continue;
    }

    nextBoard[cell.y][cell.x] = piece.kind;
  }

  return { board: nextBoard, toppedOut };
}

export function hasCollision(board: BoardMatrix, piece: ActivePiece): boolean {
  return getPieceCells(piece).some((cell) => {
    if (cell.x < 0 || cell.x >= BOARD_COLUMNS || cell.y >= BOARD_ROWS) {
      return true;
    }

    if (cell.y < 0) {
      return false;
    }

    return board[cell.y][cell.x] !== null;
  });
}

export function clearCompletedLines(board: BoardMatrix) {
  // Keep only rows that still have space, then prepend empty rows so the board
  // stays the same height after compaction.
  const remainingRows = board.filter((row) => row.some((cell) => cell === null));
  const clearedLines = BOARD_ROWS - remainingRows.length;
  const paddingRows = Array.from({ length: clearedLines }, () =>
    Array.from({ length: BOARD_COLUMNS }, () => null)
  );

  return {
    board: [...paddingRows, ...remainingRows].map((row) => [...row]),
    clearedLines,
  };
}

export function getDropDistance(board: BoardMatrix, piece: ActivePiece): number {
  let distance = 0;

  while (!hasCollision(board, { ...piece, y: piece.y + distance + 1 })) {
    distance += 1;
  }

  return distance;
}

export function getGhostPiece(state: GameState): ActivePiece {
  return {
    ...state.activePiece,
    y: state.activePiece.y + getDropDistance(state.board, state.activePiece),
  };
}

function spawnNextActivePiece(board: BoardMatrix, queue: TetrominoType[]) {
  const { activePiece, nextQueue } = drawNextPiece(queue);

  return {
    activePiece,
    nextQueue,
    gameOver: hasCollision(board, activePiece),
  };
}

function settlePiece(state: GameState): GameState {
  // Locking a piece always follows the same pipeline: merge into the matrix,
  // clear full rows, update score/level, then spawn the next active piece.
  const merged = mergePieceIntoBoard(state.board, state.activePiece);
  const { board: clearedBoard, clearedLines } = clearCompletedLines(merged.board);
  const nextLines = state.lines + clearedLines;
  const nextLevel = computeLevel(nextLines);
  const nextScore = state.score + LINE_CLEAR_SCORES[clearedLines] * state.level;
  const spawned = spawnNextActivePiece(clearedBoard, state.nextQueue);
  const status =
    merged.toppedOut || spawned.gameOver ? "gameOver" : state.status;

  return {
    board: clearedBoard,
    activePiece: spawned.activePiece,
    nextQueue: spawned.nextQueue,
    score: nextScore,
    level: nextLevel,
    lines: nextLines,
    status,
  };
}

function movePiece(state: GameState, dx: number, dy: number, scoreDelta = 0): GameState {
  const nextPiece = {
    ...state.activePiece,
    x: state.activePiece.x + dx,
    y: state.activePiece.y + dy,
  };

  if (hasCollision(state.board, nextPiece)) {
    return state;
  }

  return {
    ...state,
    activePiece: nextPiece,
    score: state.score + scoreDelta,
  };
}

function rotatePiece(state: GameState): GameState {
  const nextRotation = (state.activePiece.rotation + 1) % 4;

  for (const kick of ROTATION_KICKS) {
    const candidate: ActivePiece = {
      ...state.activePiece,
      rotation: nextRotation,
      x: state.activePiece.x + kick.x,
      y: state.activePiece.y + kick.y,
    };

    if (!hasCollision(state.board, candidate)) {
      return {
        ...state,
        activePiece: candidate,
      };
    }
  }

  return state;
}

export function createGameState(queueSeed: TetrominoType[] = []): GameState {
  const board = createEmptyBoard();
  const spawned = spawnNextActivePiece(board, queueSeed);

  return {
    board,
    activePiece: spawned.activePiece,
    nextQueue: spawned.nextQueue,
    score: 0,
    level: 1,
    lines: 0,
    status: spawned.gameOver ? "gameOver" : "idle",
  };
}

export function restartGame(queueSeed: TetrominoType[] = []): GameState {
  return {
    ...createGameState(queueSeed),
    status: "running",
  };
}

export function beginGame(state: GameState): GameState {
  if (state.status === "gameOver") {
    return restartGame();
  }

  if (state.status === "idle" || state.status === "paused") {
    return {
      ...state,
      status: "running",
    };
  }

  return state;
}

export function togglePause(state: GameState): GameState {
  if (state.status === "running") {
    return {
      ...state,
      status: "paused",
    };
  }

  if (state.status === "paused") {
    return {
      ...state,
      status: "running",
    };
  }

  return state;
}

export function stepGame(state: GameState): GameState {
  if (state.status !== "running") {
    return state;
  }

  const nextPiece = {
    ...state.activePiece,
    y: state.activePiece.y + 1,
  };

  if (!hasCollision(state.board, nextPiece)) {
    return {
      ...state,
      activePiece: nextPiece,
    };
  }

  return settlePiece(state);
}

export function applyAction(state: GameState, action: ControlAction): GameState {
  if (action === "restart") {
    return restartGame();
  }

  if (action === "pause") {
    return togglePause(state);
  }

  if (state.status !== "running") {
    return state;
  }

  switch (action) {
    case "left":
      return movePiece(state, -1, 0);
    case "right":
      return movePiece(state, 1, 0);
    case "rotate":
      return rotatePiece(state);
    case "softDrop": {
      const dropped = movePiece(state, 0, 1, 1);
      return dropped === state ? settlePiece(state) : dropped;
    }
    case "hardDrop": {
      // Hard drop scores by distance first, then resolves the same lock/clear
      // pipeline as a normal landing.
      const dropDistance = getDropDistance(state.board, state.activePiece);
      const droppedState = {
        ...state,
        activePiece: {
          ...state.activePiece,
          y: state.activePiece.y + dropDistance,
        },
        score: state.score + dropDistance * 2,
      };
      return settlePiece(droppedState);
    }
    default:
      return state;
  }
}

