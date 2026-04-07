import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { createEmptyBoard, restartGame } from "@/game/core/tetrisEngine";
import type { GameState } from "@/game/core/types";
import { GameBoardRenderer } from "@/game/rendering/gameBoardRenderer";
import { PreviewRenderer } from "@/game/rendering/previewRenderer";

interface MockSurface {
  canvas: HTMLCanvasElement;
  clearRect: ReturnType<typeof vi.fn>;
  createLinearGradient: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  gradientAddColorStop: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
}

function createMockSurface(width = 120, height = 240): MockSurface {
  const gradientAddColorStop = vi.fn();
  const createLinearGradient = vi.fn(() => ({
    addColorStop: gradientAddColorStop,
  }));
  const clearRect = vi.fn();
  const fillRect = vi.fn();
  const strokeRect = vi.fn();
  const beginPath = vi.fn();
  const moveTo = vi.fn();
  const lineTo = vi.fn();
  const stroke = vi.fn();
  const save = vi.fn();
  const restore = vi.fn();
  const setTransform = vi.fn();

  const context = {
    beginPath,
    clearRect,
    createLinearGradient,
    fillRect,
    globalAlpha: 1,
    lineTo,
    lineWidth: 0,
    moveTo,
    restore,
    save,
    setTransform,
    stroke,
    strokeRect,
    fillStyle: "",
    strokeStyle: "",
  } as unknown as CanvasRenderingContext2D;

  const rect = {
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON() {
      return {};
    },
  } as DOMRect;

  const canvas = {
    getBoundingClientRect: () => rect,
    getContext: vi.fn(() => context),
    height: 0,
    width: 0,
  } as unknown as HTMLCanvasElement;

  return {
    canvas,
    clearRect,
    createLinearGradient,
    fillRect,
    gradientAddColorStop,
    strokeRect,
  };
}

function createRunningState(): GameState {
  const board = createEmptyBoard();
  board[19][0] = "O";

  return {
    ...restartGame(["T", "I", "O"]),
    board,
    activePiece: {
      kind: "T",
      rotation: 0,
      x: 3,
      y: 0,
    },
    nextQueue: ["I", "O", "S", "Z", "J", "L"],
  };
}

describe("render", () => {
  it("draws the active board, grid, and ghost piece while running", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 2,
    });

    const surface = createMockSurface();
    const renderer = new GameBoardRenderer();

    act(() => {
      renderer.render(surface.canvas, createRunningState());
    });

    expect(surface.canvas.width).toBe(240);
    expect(surface.canvas.height).toBe(480);
    expect(surface.clearRect).toHaveBeenCalledWith(0, 0, 120, 240);
    expect(surface.createLinearGradient).toHaveBeenCalled();
    expect(surface.gradientAddColorStop).toHaveBeenCalledTimes(2);
    expect(surface.strokeRect).toHaveBeenCalled();
  });

  it("skips drawing the ghost piece when the round is over", () => {
    const runningSurface = createMockSurface();
    const gameOverSurface = createMockSurface();
    const renderer = new GameBoardRenderer();

    renderer.render(runningSurface.canvas, createRunningState());
    renderer.render(gameOverSurface.canvas, {
      ...createRunningState(),
      status: "gameOver",
    });

    expect(gameOverSurface.strokeRect.mock.calls.length).toBeLessThan(
      runningSurface.strokeRect.mock.calls.length
    );
  });

  it("returns early when the canvas context is unavailable", () => {
    const renderer = new GameBoardRenderer();
    const canvas = {
      getBoundingClientRect: () => ({
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON() {
          return {};
        },
      } as DOMRect),
      getContext: vi.fn(() => null),
      height: 0,
      width: 0,
    } as unknown as HTMLCanvasElement;

    renderer.render(canvas, createRunningState());

    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  });

  it("draws the preview piece only when one exists", () => {
    const emptySurface = createMockSurface(96, 96);
    const nextSurface = createMockSurface(96, 96);
    const renderer = new PreviewRenderer();

    renderer.render(emptySurface.canvas, null);
    renderer.render(nextSurface.canvas, "L");

    expect(nextSurface.fillRect.mock.calls.length).toBeGreaterThan(
      emptySurface.fillRect.mock.calls.length
    );
  });
});

