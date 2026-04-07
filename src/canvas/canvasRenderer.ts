export interface CanvasRenderer<T> {
  // 约定很轻：给定一个 canvas 和当前值，把这一帧完整画出来。
  render(canvas: HTMLCanvasElement, value: T): void;
}
