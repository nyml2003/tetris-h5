export interface ElementSize {
  width: number;
  height: number;
}

interface ElementSizeTarget {
  clientWidth: number;
  clientHeight: number;
}

export const EMPTY_ELEMENT_SIZE: ElementSize = {
  width: 0,
  height: 0,
};

export function measureElementSize(target: ElementSizeTarget): ElementSize {
  return {
    width: Math.floor(target.clientWidth),
    height: Math.floor(target.clientHeight),
  };
}

export function reconcileElementSize(
  current: ElementSize,
  next: ElementSize
): ElementSize {
  if (current.width === next.width && current.height === next.height) {
    return current;
  }

  return next;
}
