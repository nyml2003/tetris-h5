import { useReducer } from "react";
import type { ControlAction } from "@/game/types";

import { zhCN } from "@/app/copy";
import {
  createSummaryStats,
  selectIsGameScreen,
  selectIsPlayable,
  selectNextPiece,
  selectSettingsFromGame,
} from "@/app/tetrisAppViewModel";
import {
  createAppState,
  reduceAppState,
  type AppAction,
  type AppScreen,
  type AppState,
  type SettingsSource,
} from "@/app/tetrisAppState";
import { useTetrisGameLoop } from "@/app/useTetrisGameLoop";
import { useTetrisKeyboard } from "@/app/useTetrisKeyboard";

export {
  createAppState,
  reduceAppState,
  type AppAction,
  type AppScreen,
  type AppState,
  type SettingsSource,
} from "@/app/tetrisAppState";

export function useTetrisApp() {
  const [state, dispatch] = useReducer(reduceAppState, undefined, createAppState);

  useTetrisGameLoop(state, dispatch);
  useTetrisKeyboard(state, dispatch);

  const nextPiece = selectNextPiece(state);
  const isGameScreen = selectIsGameScreen(state);
  const isPlayable = selectIsPlayable(state);
  const settingsFromGame = selectSettingsFromGame(state);
  const summaryStats = createSummaryStats(state.game, zhCN);

  function dispatchControl(control: ControlAction) {
    dispatch({ type: "control", control });
  }

  function dispatchAction(action: AppAction) {
    dispatch(action);
  }

  return {
    copy: zhCN,
    screen: state.screen as AppScreen,
    settingsSource: state.settingsSource as SettingsSource,
    gameState: state.game,
    nextPiece,
    isPlayable,
    isGameScreen,
    settingsFromGame,
    summaryStats,
    startGame: () => dispatchAction({ type: "start" }),
    playAgain: () => dispatchAction({ type: "playAgain" }),
    goHome: () => dispatchAction({ type: "goHome" }),
    openHomeSettings: () =>
      dispatchAction({ type: "openSettings", source: "home" }),
    openGameSettings: () =>
      dispatchAction({ type: "openSettings", source: "game" }),
    leaveSettings: () => dispatchAction({ type: "leaveSettings" }),
    moveLeft: () => dispatchControl("left"),
    rotate: () => dispatchControl("rotate"),
    moveRight: () => dispatchControl("right"),
    softDrop: () => dispatchControl("softDrop"),
    hardDrop: () => dispatchControl("hardDrop"),
  };
}
