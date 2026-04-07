import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useElementSize } from "@/app/hooks/useElementSize";

import { ResizeObserverMock, emitResize } from "../../utils/browser";
import { renderElement } from "../../utils/renderHarness";

const clientWidthDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "clientWidth"
);
const clientHeightDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "clientHeight"
);

function installClientSizeGetters() {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return Number(this.getAttribute("data-width") ?? 0);
    },
  });

  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return Number(this.getAttribute("data-height") ?? 0);
    },
  });
}

afterEach(() => {
  if (clientWidthDescriptor) {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", clientWidthDescriptor);
  }

  if (clientHeightDescriptor) {
    Object.defineProperty(HTMLElement.prototype, "clientHeight", clientHeightDescriptor);
  }
});

describe("useElementSize", () => {
  it("measures the element on mount and reacts to resize observer updates", () => {
    ResizeObserverMock.install();
    installClientSizeGetters();

    let current: ReturnType<typeof useElementSize<HTMLDivElement>> | null = null;

    function getCurrent() {
      if (current === null) {
        throw new Error("Hook result is not ready.");
      }

      return current;
    }

    function Harness(props: { height: number; width: number }) {
      current = useElementSize<HTMLDivElement>();
      return <div ref={getCurrent().ref} data-height={props.height} data-width={props.width} />;
    }

    const rendered = renderElement(<Harness height={240} width={120} />);
    const observer = ResizeObserverMock.instances[0];

    expect(getCurrent().size).toEqual({ height: 240, width: 120 });

    rendered.rerender(<Harness height={300} width={160} />);
    act(() => {
      emitResize(rendered.container.firstElementChild ?? undefined);
    });

    expect(getCurrent().size).toEqual({ height: 300, width: 160 });

    rendered.unmount();

    expect(observer?.disconnect).toHaveBeenCalledOnce();
  });

  it("reuses the current size object when dimensions do not change", () => {
    ResizeObserverMock.install();
    installClientSizeGetters();

    let current: ReturnType<typeof useElementSize<HTMLDivElement>> | null = null;

    function getCurrent() {
      if (current === null) {
        throw new Error("Hook result is not ready.");
      }

      return current;
    }

    function Harness() {
      current = useElementSize<HTMLDivElement>();
      return <div ref={getCurrent().ref} data-height={180} data-width={90} />;
    }

    const rendered = renderElement(<Harness />);
    const firstSize = getCurrent().size;

    act(() => {
      emitResize(rendered.container.firstElementChild ?? undefined);
    });

    expect(getCurrent().size).toBe(firstSize);
  });
});

