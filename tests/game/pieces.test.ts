import { describe, expect, it, vi } from "vitest";

import {
  TETROMINO_ORDER,
  createShuffledBag,
  createSpawnPiece,
  getPieceCells,
  getRotationCells,
} from "@/game/pieces";

describe("pieces", () => {
  it("reads rotation data with normalized indices", () => {
    expect(getRotationCells("T", -1)).toEqual(getRotationCells("T", 3));
    expect(getRotationCells("L", 5)).toEqual(getRotationCells("L", 1));
  });

  it("maps piece cells into board coordinates", () => {
    const cells = getPieceCells({
      kind: "O",
      rotation: 0,
      x: 4,
      y: 10,
    });

    expect(cells).toEqual([
      { x: 5, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 11 },
      { x: 6, y: 11 },
    ]);
  });

  it("creates spawn pieces at the standard entry point", () => {
    expect(createSpawnPiece("S")).toEqual({
      kind: "S",
      rotation: 0,
      x: 3,
      y: -1,
    });
  });

  it("shuffles the full bag without dropping tetrominoes", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const bag = createShuffledBag();

    expect(bag).toEqual(["O", "T", "S", "Z", "J", "L", "I"]);
    expect([...bag].sort()).toEqual([...TETROMINO_ORDER].sort());
  });
});
