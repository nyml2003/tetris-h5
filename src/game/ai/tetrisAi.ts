import { BOARD_COLUMNS, BOARD_ROWS } from "@/game/core/constants";
import { applyAction } from "@/game/core/tetrisEngine";
import type {
  BoardMatrix,
  ControlAction,
  GameState,
} from "@/game/core/types";

const MOVEMENT_ACTIONS = ["rotate", "left", "right"] as const;

export interface AiPlacementPlan {
  actions: readonly ControlAction[];
  score: number;
  target: {
    rotation: number;
    x: number;
    y: number;
  };
}

interface SearchNode {
  actions: readonly ControlAction[];
  state: GameState;
}

function serializePiece(state: GameState): string {
  const { activePiece } = state;
  return `${activePiece.rotation}:${activePiece.x}:${activePiece.y}`;
}

function measureColumnHeights(board: BoardMatrix): number[] {
  return Array.from({ length: BOARD_COLUMNS }, (_, columnIndex) => {
    const firstFilledRow = board.findIndex((row) => row[columnIndex] !== null);

    if (firstFilledRow < 0) {
      return 0;
    }

    return BOARD_ROWS - firstFilledRow;
  });
}

export function countBoardHoles(board: BoardMatrix): number {
  let holes = 0;

  for (let columnIndex = 0; columnIndex < BOARD_COLUMNS; columnIndex += 1) {
    let foundFilledCell = false;

    for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex += 1) {
      const cell = board[rowIndex][columnIndex];

      if (cell !== null) {
        foundFilledCell = true;
        continue;
      }

      if (foundFilledCell) {
        holes += 1;
      }
    }
  }

  return holes;
}

function measureBumpiness(heights: readonly number[]): number {
  let bumpiness = 0;

  for (let index = 1; index < heights.length; index += 1) {
    bumpiness += Math.abs(heights[index] - heights[index - 1]);
  }

  return bumpiness;
}

export function evaluateBoard(board: BoardMatrix, clearedLines: number): number {
  const heights = measureColumnHeights(board);
  const aggregateHeight = heights.reduce((total, height) => total + height, 0);
  const maxHeight = Math.max(...heights);
  const holes = countBoardHoles(board);
  const bumpiness = measureBumpiness(heights);

  return (
    clearedLines * 1400 -
    aggregateHeight * 6 -
    maxHeight * 8 -
    holes * 45 -
    bumpiness * 12
  );
}

function isBetterPlan(
  candidate: AiPlacementPlan,
  best: AiPlacementPlan | null
): boolean {
  if (!best) {
    return true;
  }

  if (candidate.score !== best.score) {
    return candidate.score > best.score;
  }

  return candidate.actions.length < best.actions.length;
}

export function planAiMove(state: GameState): AiPlacementPlan | null {
  if (state.status !== "running") {
    return null;
  }

  const queue: SearchNode[] = [
    {
      actions: [],
      state,
    },
  ];
  const visited = new Set([serializePiece(state)]);
  let bestPlan: AiPlacementPlan | null = null;

  while (queue.length > 0) {
    const node = queue.shift();

    if (!node) {
      continue;
    }

    const settledState = applyAction(node.state, "hardDrop");
    const clearedLines = settledState.lines - state.lines;
    const candidatePlan: AiPlacementPlan = {
      actions: [...node.actions, "hardDrop"],
      score: evaluateBoard(settledState.board, clearedLines) - node.actions.length,
      target: {
        rotation: node.state.activePiece.rotation,
        x: node.state.activePiece.x,
        y: node.state.activePiece.y,
      },
    };

    if (isBetterPlan(candidatePlan, bestPlan)) {
      bestPlan = candidatePlan;
    }

    for (const action of MOVEMENT_ACTIONS) {
      const nextState = applyAction(node.state, action);

      if (nextState === node.state) {
        continue;
      }

      const nextKey = serializePiece(nextState);

      if (visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      queue.push({
        actions: [...node.actions, action],
        state: nextState,
      });
    }
  }

  return bestPlan;
}

