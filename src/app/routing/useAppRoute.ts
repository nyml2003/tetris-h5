import { useEffect, useEffectEvent, useRef } from "react";
import type { Dispatch } from "react";

import {
  createAppHistoryState,
  getRoutePathForState,
  resolveAppRouteState,
} from "@/app/routing/appRoute";
import type { AppAction, AppState } from "@/app/state/types";

export function useAppRouteSync(
  state: AppState,
  dispatch: Dispatch<AppAction>
) {
  const mountedRef = useRef(false);
  const popNavigationRef = useRef(false);
  const previousStateRef = useRef(state);
  const lastPathRef = useRef(getRoutePathForState(state));

  const handlePopState = useEffectEvent((event: PopStateEvent) => {
    const nextState = resolveAppRouteState(window.location.pathname, event.state);

    popNavigationRef.current = true;
    previousStateRef.current = nextState;
    lastPathRef.current = getRoutePathForState(nextState);
    dispatch({ type: "restore", state: nextState });
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const listener = (event: PopStateEvent) => {
      handlePopState(event);
    };

    window.addEventListener("popstate", listener);

    return () => {
      window.removeEventListener("popstate", listener);
    };
  }, [handlePopState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextPath = getRoutePathForState(state);

    if (!mountedRef.current) {
      mountedRef.current = true;
      previousStateRef.current = state;
      lastPathRef.current = nextPath;
      window.history.replaceState(createAppHistoryState(state), "", nextPath);

      return;
    }

    if (popNavigationRef.current) {
      popNavigationRef.current = false;
      previousStateRef.current = state;
      lastPathRef.current = nextPath;
      window.history.replaceState(createAppHistoryState(state), "", nextPath);

      return;
    }

    const previousState = previousStateRef.current;
    const previousPath = lastPathRef.current;
    const shouldRefreshCurrentEntry =
      previousState.screen !== state.screen ||
      previousState.playerMode !== state.playerMode ||
      previousState.settingsSource !== state.settingsSource ||
      previousState.helpPage !== state.helpPage;

    if (nextPath === previousPath) {
      if (shouldRefreshCurrentEntry) {
        window.history.replaceState(createAppHistoryState(state), "", nextPath);
      }

      previousStateRef.current = state;
      lastPathRef.current = nextPath;

      return;
    }

    window.history.replaceState(
      createAppHistoryState(previousState),
      "",
      previousPath
    );
    window.history.pushState(createAppHistoryState(state), "", nextPath);
    previousStateRef.current = state;
    lastPathRef.current = nextPath;
  }, [state]);
}

