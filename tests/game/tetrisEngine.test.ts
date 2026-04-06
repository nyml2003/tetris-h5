import { describe, expect, it } from "vitest";

import {
  applyAction,
  beginGame,
  clearCompletedLines,
  createEmptyBoard,
  createGameState,
  getDropDistance,
  getGhostPiece,
  hasCollision,
  restartGame,
  stepGame,
  togglePause,
} from "@/game/tetrisEngine";
import type { ActivePiece, GameState } from "@/game/types";

function createRunningState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...restartGame(["T", "O", "I"]),
    ...overrides,
  };
}

describe("tetrisEngine", () => {
  it("creates an idle game with a spawned active piece and queue", () => {
    const state = createGameState(["I", "O", "T"]);

    expect(state.status).toBe("idle");
    expect(state.activePiece.kind).toBe("I");
    expect(state.nextQueue[0]).toBe("O");
  });

  it("moves the active piece down on each running tick", () => {
    const state = restartGame(["T", "O", "I"]);
    const nextState = stepGame(state);

    expect(nextState.activePiece.y).toBe(state.activePiece.y + 1);
  });

  it("locks a piece and spawns the next queued piece after a hard drop", () => {
    const state: GameState = {
      ...createRunningState(),
      board: createEmptyBoard(),
      activePiece: {
        kind: "O",
        rotation: 0,
        x: 3,
        y: 0,
      },
      nextQueue: ["I", "T", "S", "Z", "J", "L"],
    };

    const nextState = applyAction(state, "hardDrop");

    expect(nextState.board[18][4]).toBe("O");
    expect(nextState.board[19][5]).toBe("O");
    expect(nextState.activePiece.kind).toBe("I");
    expect(nextState.status).toBe("running");
  });

  it("settles a blocked soft drop and clears completed rows", () => {
    const board = createEmptyBoard();
    board[19] = board[19].map((_, index) =>
      index >= 3 && index <= 6 ? null : "T"
    );

    const state: GameState = {
      ...createRunningState(),
      board,
      activePiece: {
        kind: "I",
        rotation: 0,
        x: 3,
        y: 18,
      },
      nextQueue: ["O", "T", "S", "Z", "J", "L"],
      score: 0,
      level: 1,
      lines: 0,
      status: "running",
    };

    const clearedState = applyAction(state, "softDrop");

    expect(clearedState.lines).toBe(1);
    expect(clearedState.score).toBeGreaterThanOrEqual(100);
    expect(clearedState.activePiece.kind).toBe("O");
    expect(clearedState.board[19].every((cell) => cell === null)).toBe(true);
  });

  it("applies rotation kicks when a blocker rejects the first rotation candidate", () => {
    const board = createEmptyBoard();
    board[0][5] = "O";

    const state = createRunningState({
      board,
      activePiece: {
        kind: "T",
        rotation: 0,
        x: 4,
        y: 0,
      },
    });

    const rotated = applyAction(state, "rotate");

    expect(rotated.activePiece.rotation).toBe(1);
    expect(rotated.activePiece.x).toBe(3);
  });

  it("computes collision, drop distance, and ghost position from the board", () => {
    const board = createEmptyBoard();
    board[0][0] = "Z";
    board[19][4] = "L";

    const piece: ActivePiece = {
      kind: "O",
      rotation: 0,
      x: -2,
      y: 0,
    };

    const floatingPiece: ActivePiece = {
      kind: "I",
      rotation: 0,
      x: 3,
      y: -2,
    };

    const state = createRunningState({
      board,
      activePiece: {
        kind: "I",
        rotation: 1,
        x: 2,
        y: 0,
      },
    });

    expect(hasCollision(board, piece)).toBe(true);
    expect(hasCollision(board, floatingPiece)).toBe(false);
    expect(getDropDistance(state.board, state.activePiece)).toBe(15);
    expect(getGhostPiece(state).y).toBe(15);
  });

  it("begins, pauses, resumes, and restarts based on status", () => {
    const idleState = createGameState(["L", "J", "T"]);
    const runningState = beginGame(idleState);
    const pausedState = togglePause(runningState);
    const resumedState = togglePause(pausedState);
    const restartedState = beginGame({
      ...createRunningState(),
      status: "gameOver",
    });

    expect(runningState.status).toBe("running");
    expect(pausedState.status).toBe("paused");
    expect(resumedState.status).toBe("running");
    expect(restartedState.status).toBe("running");
  });

  it("pads cleared rows at the top of the board", () => {
    const board = createEmptyBoard();
    board[18] = board[18].map(() => "J");
    board[19][0] = "L";

    const cleared = clearCompletedLines(board);

    expect(cleared.clearedLines).toBe(1);
    expect(cleared.board[0].every((cell) => cell === null)).toBe(true);
    expect(cleared.board[19][0]).toBe("L");
  });

  it("ends the game when the spawn area is blocked after a lock", () => {
    const board = createEmptyBoard();

    for (let column = 3; column < 7; column += 1) {
      board[0][column] = "Z";
    }

    const state: GameState = {
      ...createRunningState(),
      board,
      activePiece: {
        kind: "O",
        rotation: 0,
        x: 3,
        y: 14,
      },
      nextQueue: ["I", "T", "S", "Z", "J", "L"],
    };

    const nextState = applyAction(state, "hardDrop");

    expect(nextState.status).toBe("gameOver");
  });
});
