import { useEffect, useEffectEvent, useLayoutEffect, useRef } from "react";

import type { CanvasRenderer } from "@/canvas/canvasRenderer";
import { useResizeObserver } from "@/app/hooks/useResizeObserver";

export function useCanvasSurface<T>(
  value: T,
  renderer: CanvasRenderer<T>
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const scheduleRender = useEffectEvent(() => {
    // 同一个 canvas 只保留最后一次待执行的绘制请求，避免在连续
    // resize 或状态更新时把过期帧也画出来。
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;

      if (!canvasRef.current) {
        return;
      }

      renderer.render(canvasRef.current, value);
    });
  });

  // 尺寸变化和 value 变化都走同一个调度入口，这样 hook 只需要维护
  // 一套“下一帧重绘”的逻辑。
  useResizeObserver(canvasRef, scheduleRender);

  useLayoutEffect(() => {
    // 用 layout effect 确保 DOM 尺寸刚稳定就安排绘制，减少首帧闪烁。
    scheduleRender();
  }, [renderer, scheduleRender, value]);

  useEffect(() => {
    return () => {
      // 组件卸载时清掉最后一个待执行帧，避免对已销毁节点继续绘制。
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return canvasRef;
}

