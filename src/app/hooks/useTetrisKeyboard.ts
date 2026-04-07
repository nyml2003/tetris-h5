import { useEffect, useEffectEvent } from "react";
import type { Dispatch } from "react";

import {
  resolveKeyboardAction,
  shouldPreventKeyboardScroll,
} from "@/app/state/tetrisAppKeyboard";
import type { AppAction, AppState } from "@/app/state/types";

export function useTetrisKeyboard(
  state: AppState,
  dispatch: Dispatch<AppAction>
) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (shouldPreventKeyboardScroll(event.code)) {
      event.preventDefault();
    }

    const action = resolveKeyboardAction(state, event.code);

    if (!action) {
      return;
    }

    dispatch(action);
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [handleKeyDown]);
}

