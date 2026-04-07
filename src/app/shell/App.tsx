import "@/app/shell/App.css";

import type { CSSProperties } from "react";

import { pieceLabels } from "@/app/content/copy";
import { useCanvasSurface } from "@/app/hooks/useCanvasSurface";
import { useElementSize } from "@/app/hooks/useElementSize";
import { useTetrisApp } from "@/app/hooks/useTetrisApp";
import { paginateHelpSections } from "@/app/shell/paginateHelpSections";
import {
  GameScreen,
  HelpScreen,
  HomeScreen,
  ResultScreen,
  SettingsScreen,
} from "@/app/shell/screens";
import type { GameControl } from "@/app/shell/types";
import { GameBoardRenderer } from "@/game/rendering/gameBoardRenderer";
import { PreviewRenderer } from "@/game/rendering/previewRenderer";

const HELP_SECTIONS_PER_PAGE = 4;
// renderer 本身不持有业务状态，所以这里做成模块级单例即可。
// 这样 hook 只会因为 value/尺寸变化而重绘，不会因为实例重建而多跑一轮。
const gameBoardRenderer = new GameBoardRenderer();
const previewRenderer = new PreviewRenderer();

function resolveBoardStyle(
  width: number,
  height: number
): CSSProperties | undefined {
  if (width <= 0 || height <= 0) {
    return undefined;
  }

  // 棋盘固定是 10x20，因此宽高比恒定为 1:2。
  // 宽度既不能超过可用宽度，也不能超过“当前高度所能容纳的半宽”。
  const boardWidth = Math.floor(Math.min(width, height * 0.5));

  return {
    width: `${boardWidth}px`,
    height: `${boardWidth * 2}px`,
  } satisfies CSSProperties;
}

export function App() {
  const app = useTetrisApp();
  const boardCanvasRef = useCanvasSurface(app.gameState, gameBoardRenderer);
  const previewCanvasRef = useCanvasSurface(app.nextPiece, previewRenderer);
  const { ref: stageRef, size: stageSize } = useElementSize<HTMLDivElement>();

  const boardStyle = resolveBoardStyle(stageSize.width, stageSize.height);
  const helpPages = paginateHelpSections(
    app.copy.help.sections,
    HELP_SECTIONS_PER_PAGE
  );
  const totalHelpPages = Math.max(helpPages.length, 1);
  const activeHelpPage = Math.min(app.helpPage, totalHelpPages - 1);
  const activeHelpSections = helpPages[activeHelpPage] ?? [];

  const controls = [
    {
      key: "left",
      label: app.copy.controls.left,
      onPress: app.moveLeft,
      repeat: true,
    },
    {
      key: "rotate",
      label: app.copy.controls.rotate,
      onPress: app.rotate,
      accent: true,
    },
    {
      key: "right",
      label: app.copy.controls.right,
      onPress: app.moveRight,
      repeat: true,
    },
    {
      key: "softDrop",
      label: app.copy.controls.softDrop,
      onPress: app.softDrop,
      repeat: true,
    },
    {
      key: "hardDrop",
      label: app.copy.controls.hardDrop,
      onPress: app.hardDrop,
      accent: true,
    },
    {
      key: "pause",
      label: app.copy.controls.pause,
      onPress: app.openGameSettings,
    },
  ] satisfies readonly GameControl[];

  const showTakeOverAction = app.settingsFromGame && app.isAiMode;

  return (
    <div className="app-root" data-testid="app-root">
      <div className="app-glow app-glow--left" />
      <div className="app-glow app-glow--right" />

      {app.screen === "home" ? (
        <HomeScreen
          tag={app.copy.home.tag}
          title={app.copy.home.title}
          subtitle={app.copy.home.subtitle}
          bullets={app.copy.home.bullets}
          startLabel={app.copy.home.primary}
          aiLabel={app.copy.home.ai}
          helpLabel={app.copy.home.secondary}
          onStart={app.startGame}
          onAiStart={app.startAi}
          onHelp={app.openHelp}
        />
      ) : null}

      {app.screen === "help" ? (
        <HelpScreen
          tag={app.copy.help.tag}
          title={app.copy.help.title}
          subtitle={app.copy.help.subtitle}
          hint={app.copy.help.hint}
          sections={activeHelpSections}
          currentPage={activeHelpPage}
          totalPages={totalHelpPages}
          previousLabel={app.copy.help.previous}
          nextLabel={app.copy.help.next}
          startLabel={app.copy.help.primary}
          aiLabel={app.copy.help.ai}
          homeLabel={app.copy.help.home}
          onPrevious={() => app.setHelpPage(activeHelpPage - 1)}
          onNext={() => app.setHelpPage(activeHelpPage + 1)}
          onStart={app.startGame}
          onAiStart={app.startAi}
          onHome={app.goHome}
        />
      ) : null}

      {app.screen === "game" ? (
        <GameScreen
          title={app.copy.game.status}
          pauseLabel={app.copy.game.pause}
          modeBadge={app.gameModeBadge}
          keyboardHint={app.gameHint}
          stats={app.summaryStats}
          nextLabel={app.copy.hud.next}
          nextPiece={app.nextPiece ? pieceLabels[app.nextPiece] : "--"}
          onPause={app.openGameSettings}
          boardCanvasRef={boardCanvasRef}
          previewCanvasRef={previewCanvasRef}
          stageRef={stageRef}
          boardStyle={boardStyle}
          controlsDisabled={app.controlsDisabled}
          controls={controls}
        />
      ) : null}

      {app.screen === "settings" ? (
        <SettingsScreen
          title={app.copy.settings.title}
          subtitle={app.copy.settings.subtitle}
          items={app.settingsItems}
          primaryLabel={
            app.settingsFromGame
              ? app.copy.settings.resume
              : app.copy.settings.start
          }
          takeOverLabel={
            showTakeOverAction ? app.copy.settings.takeOver : undefined
          }
          restartLabel={app.copy.settings.restart}
          homeLabel={app.copy.settings.home}
          onPrimary={app.settingsFromGame ? app.leaveSettings : app.startGame}
          onTakeOver={showTakeOverAction ? app.takeOver : undefined}
          onRestart={app.playAgain}
          onHome={app.goHome}
        />
      ) : null}

      {app.screen === "result" ? (
        <ResultScreen
          tag={app.copy.result.tag}
          title={app.copy.result.title}
          subtitle={app.copy.result.subtitle}
          stats={app.summaryStats}
          primaryLabel={app.copy.result.primary}
          secondaryLabel={app.copy.result.secondary}
          onPrimary={app.playAgain}
          onSecondary={app.goHome}
        />
      ) : null}
    </div>
  );
}
