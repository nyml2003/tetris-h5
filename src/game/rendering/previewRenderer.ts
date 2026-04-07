import { PREVIEW_COLUMNS, PREVIEW_ROWS } from "@/game/core/constants";
import { PIECE_COLORS, getRotationCells } from "@/game/core/pieces";
import type { GridPoint, TetrominoType } from "@/game/core/types";
import { Canvas2dRenderer } from "@/game/rendering/canvas2dRenderer";

interface PreviewPlacement {
  cellSize: number;
  originX: number;
  originY: number;
}

export class PreviewRenderer extends Canvas2dRenderer<TetrominoType | null> {
  render(canvas: HTMLCanvasElement, nextPiece: TetrominoType | null): void {
    const preparedCanvas = this.prepareCanvas(canvas);

    if (!preparedCanvas) {
      return;
    }

    const { context, width, height } = preparedCanvas;
    const cellSize = Math.min(width / PREVIEW_COLUMNS, height / PREVIEW_ROWS);

    this.drawBackdrop(context, width, height);
    this.drawGrid(context, width, height, PREVIEW_COLUMNS, PREVIEW_ROWS);

    if (!nextPiece) {
      return;
    }

    const cells = getRotationCells(nextPiece, 0);
    const placement = this.resolvePlacement(cells, width, height, cellSize);

    cells.forEach((cell) => {
      this.drawFilledCell(
        context,
        {
          x: placement.originX + cell.x,
          y: placement.originY + cell.y,
        },
        placement.cellSize,
        placement.cellSize,
        PIECE_COLORS[nextPiece]
      );
    });
  }

  private resolvePlacement(
    cells: readonly GridPoint[],
    width: number,
    height: number,
    cellSize: number
  ): PreviewPlacement {
    const minX = Math.min(...cells.map((cell) => cell.x));
    const maxX = Math.max(...cells.map((cell) => cell.x));
    const minY = Math.min(...cells.map((cell) => cell.y));
    const maxY = Math.max(...cells.map((cell) => cell.y));
    const pieceWidth = (maxX - minX + 1) * cellSize;
    const pieceHeight = (maxY - minY + 1) * cellSize;

    // Center the piece by its occupied bounding box, then translate the result
    // back into cell coordinates so `drawFilledCell` can keep its usual math.
    return {
      cellSize,
      originX: (width - pieceWidth) / (2 * cellSize) - minX,
      originY: (height - pieceHeight) / (2 * cellSize) - minY,
    };
  }
}
