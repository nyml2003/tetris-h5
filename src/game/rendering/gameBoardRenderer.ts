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

    // 棋盘按“底板 -> 已落块 -> 幽灵块 -> 当前活动块”的顺序绘制。
    // 后画的内容天然覆盖前面，读代码时也更容易对上屏幕层级。
    this.drawBackdrop(context, width, height);
    this.drawGrid(context, width, height, BOARD_COLUMNS, BOARD_ROWS);
    this.drawSettledCells(context, state, cellWidth, cellHeight);

    if (state.status !== "gameOver") {
      // 结算后不再显示幽灵块，避免玩家看到一个“还可以继续操作”的落点提示。
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
    // board 里存的是已经锁定进矩阵的方块，它们是棋盘的静态底层内容。
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
    // ghost piece 直接复用引擎给出的最终落点，这里不重复推导规则。
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
    // 活动块始终最后画，保证玩家当前操作的对象最显眼。
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
    // 引擎坐标允许方块先出现在可视区域上方的出生行；渲染时把这部分跳过，
    // 这样屏幕只画玩家真正能看到的棋盘区域。
    cells
      .filter((cell) => cell.y >= 0)
      .forEach((cell) => {
        drawCell(cell);
      });
  }
}
