import { BOARD_COLUMNS, BOARD_ROWS } from "@/game/core/constants";
import { PIECE_COLORS, getPieceCells } from "@/game/core/pieces";
import { getGhostPiece } from "@/game/core/tetrisEngine";
import type { GameState, GridPoint } from "@/game/core/types";
import { Canvas2dRenderer } from "@/game/rendering/canvas2dRenderer";

export class GameBoardRenderer extends Canvas2dRenderer<GameState> {
  render(canvas: HTMLCanvasElement, state: GameState): void {
    const preparedCanvas = this.prepareCanvas(canvas);

    if (!preparedCanvas) {
      return;
    }

    const { context, width, height } = preparedCanvas;
    const cellWidth = width / BOARD_COLUMNS;
    const cellHeight = height / BOARD_ROWS;

    // Draw in visual stacking order so each later step can intentionally sit on
    // top of the previous one: board shell, settled cells, ghost, then active piece.
    this.drawBackdrop(context, width, height);
    this.drawGrid(context, width, height, BOARD_COLUMNS, BOARD_ROWS);
    this.drawSettledCells(context, state, cellWidth, cellHeight);

    if (state.status !== "gameOver") {
      this.drawGhostPiece(context, state, cellWidth, cellHeight);
    }

    this.drawActivePiece(context, state, cellWidth, cellHeight);
  }

  private drawSettledCells(
    context: CanvasRenderingContext2D,
    state: GameState,
    cellWidth: number,
    cellHeight: number
  ) {
    state.board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (!cell) {
          return;
        }

        this.drawFilledCell(
          context,
          { x: columnIndex, y: rowIndex },
          cellWidth,
          cellHeight,
          PIECE_COLORS[cell],
          0.9
        );
      });
    });
  }

  private drawGhostPiece(
    context: CanvasRenderingContext2D,
    state: GameState,
    cellWidth: number,
    cellHeight: number
  ) {
    const ghostPiece = getGhostPiece(state);

    this.drawVisibleCells(
      getPieceCells(ghostPiece),
      (cell) => {
        this.drawGhostCell(
          context,
          cell,
          cellWidth,
          cellHeight,
          PIECE_COLORS[state.activePiece.kind]
        );
      }
    );
  }

  private drawActivePiece(
    context: CanvasRenderingContext2D,
    state: GameState,
    cellWidth: number,
    cellHeight: number
  ) {
    this.drawVisibleCells(
      getPieceCells(state.activePiece),
      (cell) => {
        this.drawFilledCell(
          context,
          cell,
          cellWidth,
          cellHeight,
          PIECE_COLORS[state.activePiece.kind]
        );
      }
    );
  }

  private drawVisibleCells(
    cells: readonly GridPoint[],
    drawCell: (cell: GridPoint) => void
  ) {
    // Spawn rows live above the visible board; skip them here so the renderer
    // mirrors the player's viewport instead of the engine's full coordinate space.
    cells
      .filter((cell) => cell.y >= 0)
      .forEach((cell) => {
        drawCell(cell);
      });
  }
}
