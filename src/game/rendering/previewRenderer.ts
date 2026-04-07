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

    // 预览区沿用棋盘的背景和网格，但只负责展示一个被居中的 next piece。
    this.drawBackdrop(context, width, height);
    this.drawGrid(context, width, height, PREVIEW_COLUMNS, PREVIEW_ROWS);

    if (!nextPiece) {
      // 没有下一个方块时保留空底板，避免预览区尺寸和视觉节奏发生变化。
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

    // 先按实际占用包围盒算居中位置，再把结果折回“格子坐标”。
    // 这样下面仍然可以复用 drawFilledCell，而不用单独写一套像素级绘制逻辑。
    return {
      cellSize,
      originX: (width - pieceWidth) / (2 * cellSize) - minX,
      originY: (height - pieceHeight) / (2 * cellSize) - minY,
    };
  }
}
