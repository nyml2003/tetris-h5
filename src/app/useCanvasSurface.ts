import { useEffect, useEffectEvent, useLayoutEffect, useRef } from "react";

import { useResizeObserver } from "@/app/useResizeObserver";

export function useCanvasSurface<T>(
  value: T,
  draw: (canvas: HTMLCanvasElement, value: T) => void
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const requestDraw = useEffectEvent(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;

      if (!canvasRef.current) {
        return;
      }

      draw(canvasRef.current, value);
    });
  });

  useResizeObserver(canvasRef, requestDraw);

  useLayoutEffect(() => {
    requestDraw();
  }, [requestDraw, value]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return canvasRef;
}
