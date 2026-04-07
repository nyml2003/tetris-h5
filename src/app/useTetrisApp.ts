import { useReducer } from "react";
import type { ControlAction } from "@/game/types";

import { zhCN } from "@/app/copy";
import {
  createSettingsItems,
  createSummaryStats,
  selectControlsDisabled,
  selectGameHint,
  selectGameModeBadge,
  selectIsAiMode,
  selectIsGameScreen,
  selectIsPlayable,
  selectNextPiece,
  selectSettingsFromGame,
} from "@/app/tetrisAppViewModel";
import {
  createAppState,
  reduceAppState,
  type AppAction,
} from "@/app/tetrisAppState";
import { useTetrisAutoplay } from "@/app/useTetrisAutoplay";
import { useTetrisGameLoop } from "@/app/useTetrisGameLoop";
import { useTetrisKeyboard } from "@/app/useTetrisKeyboard";

export {
  createAppState,
  reduceAppState,
  type AppAction,
  type AppScreen,
  type AppState,
  type PlayerMode,
  type SettingsSource,
} from "@/app/tetrisAppState";

export function useTetrisApp() {
  const [state, dispatch] = useReducer(reduceAppState, undefined, createAppState);

  useTetrisGameLoop(state, dispatch);
  useTetrisAutoplay(state, dispatch);
  useTetrisKeyboard(state, dispatch);

  const nextPiece = selectNextPiece(state);
  const isAiMode = selectIsAiMode(state);
  const isGameScreen = selectIsGameScreen(state);
  const isPlayable = selectIsPlayable(state);
  const controlsDisabled = selectControlsDisabled(state);
  const settingsFromGame = selectSettingsFromGame(state);
  const settingsItems = createSettingsItems(state, zhCN);
  const summaryStats = createSummaryStats(state.game, zhCN);
  const gameHint = selectGameHint(state, zhCN);
  const gameModeBadge = selectGameModeBadge(state, zhCN);

  function dispatchControl(control: ControlAction) {
    dispatch({ type: "control", control });
  }

  function dispatchAction(action: AppAction) {
    dispatch(action);
  }

  return {
    copy: zhCN,
    playerMode: state.playerMode,
    screen: state.screen,
    settingsSource: state.settingsSource,
    gameState: state.game,
    nextPiece,
    isAiMode,
    isPlayable,
    isGameScreen,
    controlsDisabled,
    settingsFromGame,
    settingsItems,
    summaryStats,
    gameHint,
    gameModeBadge,
    startGame: () => dispatchAction({ type: "start" }),
    startAi: () => dispatchAction({ type: "startAi" }),
    takeOver: () => dispatchAction({ type: "takeOver" }),
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