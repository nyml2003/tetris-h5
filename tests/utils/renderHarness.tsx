import { act } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";

export function renderElement(element: ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    rerender: (nextElement: ReactElement) => {
      act(() => {
        root.render(nextElement);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

export function renderHook<Result>(useHook: () => Result) {
  let current: Result | null = null;

  function Harness() {
    current = useHook();
    return null;
  }

  const rendered = renderElement(<Harness />);

  return {
    get current() {
      if (current === null) {
        throw new Error("Hook result is not ready.");
      }

      return current;
    },
    unmount: () => {
      rendered.unmount();
    },
  };
}
