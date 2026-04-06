import { useEffect, useEffectEvent } from "react";
import type { RefObject } from "react";

export function useResizeObserver<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onResize: () => void
) {
  const handleResize = useEffectEvent(() => {
    if (!ref.current) {
      return;
    }

    onResize();
  });

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [handleResize, ref]);
}
