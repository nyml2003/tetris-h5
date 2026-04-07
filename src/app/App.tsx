import "@/app/App.css";

import type { CSSProperties, RefObject } from "react";

import { pieceLabels } from "@/app/copy";
import { useCanvasSurface } from "@/app/useCanvasSurface";
import { useElementSize } from "@/app/useElementSize";
import { usePressRepeat } from "@/app/usePressRepeat";
import { useTetrisApp } from "@/app/useTetrisApp";
import { drawGameBoard, drawPreview } from "@/game/render";

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  repeat?: boolean;
  disabled?: boolean;
  accent?: boolean;
}

interface HomeScreenProps {
  title: string;
  tag: string;
  subtitle: string;
  bullets: readonly string[];
  startLabel: string;
  aiLabel: string;
  settingsLabel: string;
  onStart: () => void;
  onAiStart: () => void;
  onSettings: () => void;
}

interface GameScreenProps {
  title: string;
  pauseLabel: string;
  modeBadge: string | null;
  keyboardHint: string;
  stats: readonly { label: string; value: string }[];
  nextLabel: string;
  nextPiece: string;
  onPause: () => void;
  boardCanvasRef: RefObject<HTMLCanvasElement | null>;
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  boardStyle: CSSProperties | undefined;
  controlsDisabled: boolean;
  controls: readonly {
    key: string;
    label: string;
    onPress: () => void;
    repeat?: boolean;
    accent?: boolean;
  }[];
}

interface SettingsScreenProps {
  title: string;
  subtitle: string;
  items: readonly { label: string; value: string }[];
  primaryLabel: string;
  takeOverLabel?: string;
  restartLabel: string;
  homeLabel: string;
  onPrimary: () => void;
  onTakeOver?: () => void;
  onRestart: () => void;
  onHome: () => void;
}

interface ResultScreenProps {
  tag: string;
  title: string;
  subtitle: string;
  stats: readonly { label: string; value: string }[];
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}

function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`action-button action-button--${variant}`}
      onClick={onPress}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function ControlButton({
  label,
  onPress,
  repeat = false,
  disabled = false,
  accent = false,
}: ControlButtonProps) {
  const pressBind = usePressRepeat(onPress, {
    disabled,
    repeat,
  });

  return (
    <button
      type="button"
      className={`control-button${accent ? " control-button--accent" : ""}`}
      disabled={disabled}
      {...pressBind}
    >
      <span className="control-button__text">{label}</span>
      <span className="control-button__hint">{repeat ? "按住连发" : "单次触发"}</span>
    </button>
  );
}

function HomeScreen({
  title,
  tag,
  subtitle,
  bullets,
  startLabel,
  aiLabel,
  settingsLabel,
  onStart,
  onAiStart,
  onSettings,
}: HomeScreenProps) {
  return (
    <section className="app-screen">
      <div className="screen-card screen-card--hero">
        <span className="screen-tag">{tag}</span>
        <h1 className="screen-title">{title}</h1>
        <p className="screen-subtitle">{subtitle}</p>

        <ul className="screen-list">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="screen-actions">
        <ActionButton label={startLabel} onPress={onStart} />
        <ActionButton label={aiLabel} onPress={onAiStart} variant="secondary" />
        <ActionButton
          label={settingsLabel}
          onPress={onSettings}
          variant="secondary"
        />
      </div>
    </section>
  );
}

function GameScreen({
  title,
  pauseLabel,
  modeBadge,
  keyboardHint,
  stats,
  nextLabel,
  nextPiece,
  onPause,
  boardCanvasRef,
  previewCanvasRef,
  stageRef,
  boardStyle,
  controlsDisabled,
  controls,
}: GameScreenProps) {
  return (
    <section className="app-screen">
      <header className="game-topbar">
        <div className="game-topbar__title">
          <div className="game-topbar__meta">
            <span className="screen-tag">{title}</span>
            {modeBadge ? <span className="header-pill header-pill--ai">{modeBadge}</span> : null}
          </div>

          <button
            type="button"
            className="header-pill"
            onClick={onPause}
            aria-label={pauseLabel}
          >
            {pauseLabel}
          </button>
        </div>

        <div className="stats-row">
          {stats.map((item) => (
            <article key={item.label} className="stat-chip">
              <span className="stat-chip__label">{item.label}</span>
              <strong className="stat-chip__value">{item.value}</strong>
            </article>
          ))}

          <article className="stat-chip stat-chip--preview">
            <div>
              <span className="stat-chip__label">{nextLabel}</span>
              <strong className="stat-chip__value">{nextPiece}</strong>
            </div>
            <canvas
              ref={previewCanvasRef}
              className="preview-canvas"
              aria-label={nextLabel}
            />
          </article>
        </div>
      </header>

      <div ref={stageRef} className="game-stage">
        <div className="game-board-shell" style={boardStyle}>
          <canvas
            ref={boardCanvasRef}
            className="game-board-canvas"
            aria-label="俄罗斯方块棋盘"
          />
        </div>
      </div>

      <footer className="game-footer">
        <div className="controls-grid">
          {controls.map((control) => (
            <ControlButton
              key={control.key}
              label={control.label}
              onPress={control.onPress}
              repeat={control.repeat}
              accent={control.accent}
              disabled={controlsDisabled}
            />
          ))}
        </div>

        <p className="game-hint">{keyboardHint}</p>
      </footer>
    </section>
  );
}

function SettingsScreen({
  title,
  subtitle,
  items,
  primaryLabel,
  takeOverLabel,
  restartLabel,
  homeLabel,
  onPrimary,
  onTakeOver,
  onRestart,
  onHome,
}: SettingsScreenProps) {
  return (
    <section className="app-screen">
      <div className="screen-card screen-card--panel">
        <span className="screen-tag">暂停 / 设置</span>
        <h2 className="screen-title screen-title--panel">{title}</h2>
        <p className="screen-subtitle screen-subtitle--panel">{subtitle}</p>

        <div className="settings-list">
          {items.map((item) => (
            <article key={item.label} className="settings-item">
              <span className="settings-item__label">{item.label}</span>
              <strong className="settings-item__value">{item.value}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="screen-actions">
        <ActionButton label={primaryLabel} onPress={onPrimary} />
        {takeOverLabel && onTakeOver ? (
          <ActionButton
            label={takeOverLabel}
            onPress={onTakeOver}
            variant="secondary"
          />
        ) : null}
        <ActionButton label={restartLabel} onPress={onRestart} variant="secondary" />
        <ActionButton label={homeLabel} onPress={onHome} variant="secondary" />
      </div>
    </section>
  );
}

function ResultScreen({
  tag,
  title,
  subtitle,
  stats,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: ResultScreenProps) {
  return (
    <section className="app-screen">
      <div className="screen-card screen-card--result">
        <span className="screen-tag">{tag}</span>
        <h2 className="screen-title screen-title--panel">{title}</h2>
        <p className="screen-subtitle screen-subtitle--panel">{subtitle}</p>

        <div className="result-stats">
          {stats.map((item) => (
            <article key={item.label} className="result-stat">
              <span className="result-stat__label">{item.label}</span>
              <strong className="result-stat__value">{item.value}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="screen-actions">
        <ActionButton label={primaryLabel} onPress={onPrimary} />
        <ActionButton
          label={secondaryLabel}
          onPress={onSecondary}
          variant="secondary"
        />
      </div>
    </section>
  );
}

export function App() {
  const app = useTetrisApp();
  const boardCanvasRef = useCanvasSurface(app.gameState, drawGameBoard);
  const previewCanvasRef = useCanvasSurface(app.nextPiece, drawPreview);
  const { ref: stageRef, size: stageSize } = useElementSize<HTMLDivElement>();

  const boardWidth =
    stageSize.width > 0 && stageSize.height > 0
      ? Math.floor(Math.min(stageSize.width, stageSize.height * 0.5))
      : 0;

  const boardStyle =
    boardWidth > 0
      ? ({
          width: `${boardWidth}px`,
          height: `${boardWidth * 2}px`,
        } satisfies CSSProperties)
      : undefined;

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
  ] as const;
  const showTakeOverAction = app.settingsFromGame && app.isAiMode;

  return (
    <div className="app-root">
      <div className="app-glow app-glow--left" />
      <div className="app-glow app-glow--right" />

      {app.screen === "home" ? (
        <HomeScreen
          title={app.copy.home.title}
          tag={app.copy.home.tag}
          subtitle={app.copy.home.subtitle}
          bullets={app.copy.home.bullets}
          startLabel={app.copy.home.primary}
          aiLabel={app.copy.home.ai}
          settingsLabel={app.copy.home.secondary}
          onStart={app.startGame}
          onAiStart={app.startAi}
          onSettings={app.openHomeSettings}
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
