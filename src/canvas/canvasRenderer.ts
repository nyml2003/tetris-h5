export interface CanvasRenderer<T> {
  render(canvas: HTMLCanvasElement, value: T): void;
}
