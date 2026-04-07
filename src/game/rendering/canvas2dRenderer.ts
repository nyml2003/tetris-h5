import type { CanvasRenderer } from "@/canvas/canvasRenderer";
import type { GridPoint } from "@/game/core/types";

interface PreparedCanvas {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export abstract class Canvas2dRenderer<T> implements CanvasRenderer<T> {
  abstract render(canvas: HTMLCanvasElement, value: T): void;

  protected prepareCanvas(canvas: HTMLCanvasElement): PreparedCanvas | null {
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

    // The canvas keeps its CSS box size, but the backing buffer needs to track
    // device pixel ratio so the grid and cells stay sharp on high-DPI screens.
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

  protected drawBackdrop(
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

  protected drawGrid(
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

  protected drawFilledCell(
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

  protected drawGhostCell(
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
}
