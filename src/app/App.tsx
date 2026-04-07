import "@/app/App.css";

import type { CSSProperties, RefObject } from "react";

import { pieceLabels } from "@/app/copy";
import { useCanvasSurface } from "@/app/useCanvasSurface";
import { useElementSize } from "@/app/useElementSize";
import { usePressRepeat } from "@/app/usePressRepeat";
import { useTetrisApp } from "@/app/useTetrisApp";
import { drawGameBoard, drawPreview } from "@/game/render";

const HELP_SECTIONS_PER_PAGE = 4;

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

interface HelpSection {
  title: string;
  description: string;
  items: readonly { key: string; value: string }[];
}

interface HomeScreenProps {
  tag?: string;
  title: string;
  subtitle: string;
  bullets: readonly string[];
  startLabel: string;
  aiLabel: string;
  helpLabel: string;
  onStart: () => void;
  onAiStart: () => void;
  onHelp: () => void;
}

interface HelpScreenProps {
  tag: string;
  title: string;
  subtitle: string;
  hint: string;
  sections: readonly HelpSection[];
  currentPage: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  startLabel: string;
  aiLabel: string;
  homeLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onStart: () => void;
  onAiStart: () => void;
  onHome: () => void;
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
  subtitle?: string;
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
      aria-label={label}
      disabled={disabled}
      {...pressBind}
    >
      <span className="control-button__text">{label}</span>
      <span className="control-button__hint">{repeat ? "按住连发" : "单次触发"}</span>
    </button>
  );
}

function chunkSections(sections: readonly HelpSection[], pageSize: number) {
  const pages: HelpSection[][] = [];

  for (let index = 0; index < sections.length; index += pageSize) {
    pages.push(sections.slice(index, index + pageSize));
  }

  return pages;
}

function HomeScreen({
  tag,
  title,
  subtitle,
  bullets,
  startLabel,
  aiLabel,
  helpLabel,
  onStart,
  onAiStart,
  onHelp,
}: HomeScreenProps) {
  return (
    <section className="app-screen app-screen--home" data-testid="screen-home">
      <div
        className="screen-card screen-card--hero screen-card--home"
        data-testid="home-card"
      >
        {tag ? <span className="screen-tag">{tag}</span> : null}
        <h1 className="screen-title">{title}</h1>
        <p className="screen-subtitle">{subtitle}</p>

        <ul className="screen-list">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="screen-actions screen-actions--home" data-testid="home-actions">
        <ActionButton label={startLabel} onPress={onStart} />
        <ActionButton label={aiLabel} onPress={onAiStart} variant="secondary" />
        <ActionButton label={helpLabel} onPress={onHelp} variant="secondary" />
      </div>
    </section>
  );
}

function HelpScreen({
  tag,
  title,
  subtitle,
  hint,
  sections,
  currentPage,
  totalPages,
  previousLabel,
  nextLabel,
  startLabel,
  aiLabel,
  homeLabel,
  onPrevious,
  onNext,
  onStart,
  onAiStart,
  onHome,
}: HelpScreenProps) {
  return (
    <section
      className="app-screen app-screen--panel app-screen--help"
      data-testid="screen-help"
    >
      <div
        className="screen-card screen-card--panel screen-card--help"
        data-testid="help-panel"
      >
        <span className="screen-tag">{tag}</span>
        <h2 className="screen-title screen-title--panel">{title}</h2>
        <p className="screen-subtitle screen-subtitle--panel">{subtitle}</p>

        <div className="help-grid" data-testid="help-grid">
          {sections.map((section) => (
            <article key={section.title} className="help-card" data-testid="help-card">
              <div className="help-card__header">
                <strong className="help-card__title">{section.title}</strong>
                <span className="help-card__meta">{section.description}</span>
              </div>

              <div className="help-card__list">
                {section.items.map((item) => (
                  <div key={`${section.title}-${item.key}`} className="help-item">
                    <kbd className="help-item__key">{item.key}</kbd>
                    <span className="help-item__value">{item.value}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="help-footer" data-testid="help-footer">
          <div className="help-pagination" data-testid="help-pagination">
            <ActionButton
              label={previousLabel}
              onPress={onPrevious}
              variant="secondary"
              disabled={currentPage <= 0}
            />
            <span
              className="help-pagination__status"
              data-testid="help-pagination-status"
            >
              第 {currentPage + 1} / {totalPages} 页
            </span>
            <ActionButton
              label={nextLabel}
              onPress={onNext}
              variant="secondary"
              disabled={currentPage >= totalPages - 1}
            />
          </div>

          <p className="help-hint">{hint}</p>
        </div>
      </div>

      <div
        className="screen-actions screen-actions--panel screen-actions--help"
        data-testid="help-actions"
      >
        <ActionButton label={startLabel} onPress={onStart} />
        <ActionButton label={aiLabel} onPress={onAiStart} variant="secondary" />
        <ActionButton label={homeLabel} onPress={onHome} variant="secondary" />
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
    <section className="app-screen app-screen--game" data-testid="screen-game">
      <header className="game-topbar" data-testid="game-topbar">
        <div className="game-topbar__title">
          <div className="game-topbar__meta">
            <span className="screen-tag">{title}</span>
            {modeBadge ? (
              <span
                className="header-pill header-pill--ai"
                data-testid="game-mode-badge"
              >
                {modeBadge}
              </span>
            ) : null}
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

        <div className="stats-row" data-testid="stats-row">
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

      <div ref={stageRef} className="game-stage" data-testid="game-stage">
        <div className="game-board-shell" style={boardStyle} data-testid="game-board-shell">
          <canvas
            ref={boardCanvasRef}
            className="game-board-canvas"
            aria-label="俄罗斯方块棋盘"
          />
        </div>
      </div>

      <footer className="game-footer" data-testid="game-footer">
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
    <section className="app-screen app-screen--panel" data-testid="screen-settings">
      <div className="screen-card screen-card--panel" data-testid="settings-panel">
        <span className="screen-tag">暂停 / 设置</span>
        <h2 className="screen-title screen-title--panel">{title}</h2>
        {subtitle ? (
          <p className="screen-subtitle screen-subtitle--panel">{subtitle}</p>
        ) : null}

        <div className="settings-list" data-testid="settings-list">
          {items.map((item) => (
            <article key={item.label} className="settings-item">
              <span className="settings-item__label">{item.label}</span>
              <strong className="settings-item__value">{item.value}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="screen-actions screen-actions--panel" data-testid="settings-actions">
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
    <section className="app-screen app-screen--panel" data-testid="screen-result">
      <div className="screen-card screen-card--result" data-testid="result-card">
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

      <div className="screen-actions screen-actions--dual" data-testid="result-actions">
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

  const helpPages = chunkSections(app.copy.help.sections, HELP_SECTIONS_PER_PAGE);
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
  ] as const;
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
