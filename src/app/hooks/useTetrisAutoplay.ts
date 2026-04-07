import { useEffect, useEffectEvent } from "react";
import type { Dispatch } from "react";

import { planAiMove } from "@/game/ai/tetrisAi";

import type { AppAction, AppState } from "@/app/state/types";

export const AI_ACTIONS_PER_FRAME = 4;

function canAutoplay(state: AppState): boolean {
  return (
    state.playerMode === "ai" &&
    state.screen === "game" &&
    state.game.status === "running"
  );
}

export function useTetrisAutoplay(
  state: AppState,
  dispatch: Dispatch<AppAction>
) {
  const autoplayEnabled = canAutoplay(state);

  const runAutoplayFrame = useEffectEvent(() => {
    if (!canAutoplay(state)) {
      return;
    }

    const plan = planAiMove(state.game);

    if (!plan) {
      return;
    }

    for (const action of plan.actions.slice(0, AI_ACTIONS_PER_FRAME)) {
      dispatch({ type: "control", control: action });
    }
  });

  useEffect(() => {
    if (!autoplayEnabled) {
      return undefined;
    }

    let frameId = 0;

    const run = () => {
      runAutoplayFrame();
      frameId = window.requestAnimationFrame(run);
    };

    frameId = window.requestAnimationFrame(run);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [autoplayEnabled, runAutoplayFrame]);
}

