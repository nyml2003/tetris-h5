import { useEffectEvent, useLayoutEffect, useRef, useState } from "react";

import {
  EMPTY_ELEMENT_SIZE,
  measureElementSize,
  reconcileElementSize,
  type ElementSize,
} from "@/app/state/elementSize";
import { useResizeObserver } from "@/app/hooks/useResizeObserver";

export type { ElementSize } from "@/app/state/elementSize";

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>(EMPTY_ELEMENT_SIZE);

  const measure = useEffectEvent(() => {
    if (!ref.current) {
      return;
    }

    const nextSize = measureElementSize(ref.current);
    setSize((currentSize) => reconcileElementSize(currentSize, nextSize));
  });

  useResizeObserver(ref, measure);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  return { ref, size };
}

