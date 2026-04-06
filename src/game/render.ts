import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  PREVIEW_COLUMNS,
  PREVIEW_ROWS,
} from "@/game/constants";
import { PIECE_COLORS, getPieceCells, getRotationCells } from "@/game/pieces";
import { getGhostPiece } from "@/game/tetrisEngine";
import type { GameState, GridPoint, TetrominoType } from "@/game/types";

function setupCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(bounds.width));
  const height = Math.max(1, Math.floor(bounds.height));
  const ratio = window.devicePixelRatio || 1;
  const scaledWidth = Math.max(1, Math.floor(width * ratio));
  const scaledHeight = Math.max(1, Math.floor(height * ratio));

  if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  return {
    context,
    width,
    height,
  };
}

function drawBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#122034");
  gradient.addColorStop(1, "#090f1d");

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255, 255, 255, 0.03)";

  for (let index = 0; index < height; index += 20) {
    context.fillRect(0, index, width, 1);
  }
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  columns: number,
  rows: number
) {
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  context.save();
  context.strokeStyle = "rgba(255, 255, 255, 0.07)";
  context.lineWidth = 1;

  for (let column = 1; column < columns; column += 1) {
    const x = Math.round(column * cellWidth) + 0.5;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let row = 1; row < rows; row += 1) {
    const y = Math.round(row * cellHeight) + 0.5;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();
}

function drawFilledCell(
  context: CanvasRenderingContext2D,
  cell: GridPoint,
  cellWidth: number,
  cellHeight: number,
  color: string,
  alpha = 1
) {
  const x = cell.x * cellWidth;
  const y = cell.y * cellHeight;
  const inset = Math.max(2, Math.min(cellWidth, cellHeight) * 0.08);

  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(
    x + inset,
    y + inset,
    Math.max(1, cellWidth - inset * 2),
    Math.max(1, cellHeight - inset * 2)
  );
  context.fillStyle = "rgba(255, 255, 255, 0.2)";
  context.fillRect(
    x + inset,
    y + inset,
    Math.max(1, cellWidth - inset * 2),
    Math.max(2, cellHeight * 0.12)
  );
  context.strokeStyle = "rgba(255, 255, 255, 0.12)";
  context.strokeRect(
    x + inset,
    y + inset,
    Math.max(1, cellWidth - inset * 2),
    Math.max(1, cellHeight - inset * 2)
  );
  context.restore();
}

function drawGhostCell(
  context: CanvasRenderingContext2D,
  cell: GridPoint,
  cellWidth: number,
  cellHeight: number,
  color: string
) {
  const x = cell.x * cellWidth;
  const y = cell.y * cellHeight;
  const inset = Math.max(3, Math.min(cellWidth, cellHeight) * 0.11);

  context.save();
  context.strokeStyle = color;
  context.globalAlpha = 0.38;
  context.lineWidth = Math.max(1.5, Math.min(cellWidth, cellHeight) * 0.09);
  context.strokeRect(
    x + inset,
    y + inset,
    Math.max(1, cellWidth - inset * 2),
    Math.max(1, cellHeight - inset * 2)
  );
  context.restore();
}

export function drawGameBoard(canvas: HTMLCanvasElement, state: GameState) {
  const readyCanvas = setupCanvas(canvas);

  if (!readyCanvas) {
    return;
  }

  const { context, width, height } = readyCanvas;
  const cellWidth = width / BOARD_COLUMNS;
  const cellHeight = height / BOARD_ROWS;

  drawBackdrop(context, width, height);
  drawGrid(context, width, height, BOARD_COLUMNS, BOARD_ROWS);

  state.board.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (!cell) {
        return;
      }

      drawFilledCell(
        context,
        { x: columnIndex, y: rowIndex },
        cellWidth,
        cellHeight,
        PIECE_COLORS[cell],
        0.9
      );
    });
  });

  const ghostPiece = getGhostPiece(state);

  if (state.status !== "gameOver") {
    getPieceCells(ghostPiece)
      .filter((cell) => cell.y >= 0)
      .forEach((cell) => {
        drawGhostCell(
          context,
          cell,
          cellWidth,
          cellHeight,
          PIECE_COLORS[state.activePiece.kind]
        );
      });
  }

  getPieceCells(state.activePiece)
    .filter((cell) => cell.y >= 0)
    .forEach((cell) => {
      drawFilledCell(
        context,
        cell,
        cellWidth,
        cellHeight,
        PIECE_COLORS[state.activePiece.kind]
      );
    });
}

export function drawPreview(canvas: HTMLCanvasElement, nextPiece: TetrominoType | null) {
  const readyCanvas = setupCanvas(canvas);

  if (!readyCanvas) {
    return;
  }

  const { context, width, height } = readyCanvas;
  const cellSize = Math.min(width / PREVIEW_COLUMNS, height / PREVIEW_ROWS);

  drawBackdrop(context, width, height);
  drawGrid(context, width, height, PREVIEW_COLUMNS, PREVIEW_ROWS);

  if (!nextPiece) {
    return;
  }

  const cells = getRotationCells(nextPiece, 0);
  const minX = Math.min(...cells.map((cell) => cell.x));
  const maxX = Math.max(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));
  const maxY = Math.max(...cells.map((cell) => cell.y));
  const pieceWidth = (maxX - minX + 1) * cellSize;
  const pieceHeight = (maxY - minY + 1) * cellSize;
  const offsetX = (width - pieceWidth) / 2 - minX * cellSize;
  const offsetY = (height - pieceHeight) / 2 - minY * cellSize;

  cells.forEach((cell) => {
    drawFilledCell(
      context,
      {
        x: (offsetX + cell.x * cellSize) / cellSize,
        y: (offsetY + cell.y * cellSize) / cellSize,
      },
      cellSize,
      cellSize,
      PIECE_COLORS[nextPiece]
    );
  });
}
