import { describe, expect, it } from "vitest";

import { planAiMove, evaluateBoard } from "@/game/ai/tetrisAi";
import { applyAction, createEmptyBoard, restartGame } from "@/game/core/tetrisEngine";
import type { ControlAction, GameState } from "@/game/core/types";

function runActions(state: GameState, actions: readonly ControlAction[]) {
  return actions.reduce((currentState, action) => applyAction(currentState, action), state);
}

describe("tetrisAi", () => {
  it("scores flatter boards above ones with holes", () => {
    const flatBoard = createEmptyBoard();
    flatBoard[19][0] = "I";
    flatBoard[19][1] = "I";

    const holeyBoard = createEmptyBoard();
    holeyBoard[18][0] = "I";
    holeyBoard[18][1] = "I";
    holeyBoard[19][1] = "I";

    expect(evaluateBoard(flatBoard, 0)).toBeGreaterThan(evaluateBoard(holeyBoard, 0));
  });

  it("plans a hard-drop sequence that clears an available line", () => {
    const board = createEmptyBoard();
    board[19] = board[19].map((_, index) =>
      index >= 3 && index <= 6 ? null : "T"
    );

    const state: GameState = {
      ...restartGame(["I", "O", "T"]),
      board,
      activePiece: {
        kind: "I",
        rotation: 0,
        x: 3,
        y: 0,
      },
      nextQueue: ["O", "T", "S", "Z", "J", "L"],
      score: 0,
      level: 1,
      lines: 0,
      status: "running",
    };

    const plan = planAiMove(state);

    expect(plan).not.toBeNull();
    expect(plan?.actions.at(-1)).toBe("hardDrop");

    const nextState = runActions(state, plan?.actions ?? []);

    expect(nextState.lines).toBeGreaterThan(0);
    expect(nextState.status).toBe("running");
  });

  it("returns null when the round is not running", () => {
    const state: GameState = {
      ...restartGame(["T", "O", "I"]),
      status: "paused",
    };

    expect(planAiMove(state)).toBeNull();
  });
});

