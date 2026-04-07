import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { pieceLabels, zhCN } from "@/app/copy";
import { restartGame } from "@/game/tetrisEngine";

const mockUseCanvasSurface = vi.hoisted(() => vi.fn());
const mockUseElementSize = vi.hoisted(() => vi.fn());
const mockUseTetrisApp = vi.hoisted(() => vi.fn());

vi.mock("@/app/useCanvasSurface", () => ({
  useCanvasSurface: mockUseCanvasSurface,
}));
vi.mock("@/app/useElementSize", () => ({
  useElementSize: mockUseElementSize,
}));
vi.mock("@/app/useTetrisApp", () => ({
  useTetrisApp: mockUseTetrisApp,
}));

import { App } from "@/app/App";

function createMockApp(overrides: Record<string, unknown> = {}) {
  const gameState = restartGame(["I", "O", "T"]);

  return {
    controlsDisabled: true,
    copy: zhCN,
    gameHint: zhCN.game.keyboard,
    gameModeBadge: null,
    gameState,
    goHome: vi.fn(),
    hardDrop: vi.fn(),
    helpPage: 0,
    isAiMode: false,
    isGameScreen: false,
    isPlayable: false,
    leaveSettings: vi.fn(),
    moveLeft: vi.fn(),
    moveRight: vi.fn(),
    nextPiece: "I",
    openGameSettings: vi.fn(),
    openHelp: vi.fn(),
    playerMode: "manual",
    playAgain: vi.fn(),
    rotate: vi.fn(),
    screen: "home",
    setHelpPage: vi.fn(),
    settingsFromGame: false,
    settingsItems: [
      ...zhCN.settings.items,
      { label: zhCN.settings.mode, value: zhCN.settings.manualMode },
    ],
    settingsSource: "home",
    softDrop: vi.fn(),
    startAi: vi.fn(),
    startGame: vi.fn(),
    summaryStats: [
      { label: zhCN.hud.score, value: "0" },
      { label: zhCN.hud.lines, value: "0" },
      { label: zhCN.hud.level, value: "1" },
    ] as const,
    takeOver: vi.fn(),
    ...overrides,
  };
}

describe("App", () => {
  beforeEach(() => {
    mockUseCanvasSurface.mockReturnValue(createRef<HTMLCanvasElement>());
    mockUseElementSize.mockReturnValue({
      ref: createRef<HTMLDivElement>(),
      size: { height: 640, width: 320 },
    });
  });

  it("renders the home screen actions and lighter summary", () => {
    mockUseTetrisApp.mockReturnValue(createMockApp());

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain(zhCN.home.title);
    expect(markup).toContain(zhCN.home.primary);
    expect(markup).toContain(zhCN.home.ai);
    expect(markup).toContain(zhCN.home.secondary);
    expect(markup).not.toContain(zhCN.help.title);
  });

  it("renders the paged help screen content", () => {
    mockUseTetrisApp.mockReturnValue(
      createMockApp({
        helpPage: 0,
        screen: "help",
      })
    );

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain(zhCN.help.title);
    expect(markup).toContain(zhCN.help.previous);
    expect(markup).toContain(zhCN.help.next);
    expect(markup).toContain(zhCN.help.sections[0].title);
    expect(markup).toContain("第 1 / 2 页");
  });

  it("renders the gameplay screen with stats, preview, ai badge, and controls", () => {
    mockUseTetrisApp.mockReturnValue(
      createMockApp({
        controlsDisabled: true,
        gameHint: zhCN.game.aiHint,
        gameModeBadge: zhCN.game.aiBadge,
        isAiMode: true,
        isGameScreen: true,
        isPlayable: true,
        playerMode: "ai",
        screen: "game",
      })
    );

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain(zhCN.game.status);
    expect(markup).toContain(pieceLabels.I);
    expect(markup).toContain(zhCN.game.aiBadge);
    expect(markup).toContain(zhCN.game.aiHint);
    expect(markup).toContain(zhCN.controls.left);
    expect(markup).toContain(zhCN.controls.hardDrop);
  });

  it("shows the current mode inside settings", () => {
    mockUseTetrisApp.mockReturnValue(
      createMockApp({
        isAiMode: true,
        playerMode: "ai",
        screen: "settings",
        settingsFromGame: true,
        settingsItems: [
          ...zhCN.settings.items,
          { label: zhCN.settings.mode, value: zhCN.settings.aiMode },
        ],
        settingsSource: "game",
      })
    );

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain(zhCN.settings.resume);
    expect(markup).toContain(zhCN.settings.mode);
    expect(markup).toContain(zhCN.settings.aiMode);
    expect(markup).toContain(zhCN.settings.takeOver);
  });

  it("renders the result screen summary actions", () => {
    mockUseTetrisApp.mockReturnValue(
      createMockApp({
        screen: "result",
      })
    );

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain(zhCN.result.title);
    expect(markup).toContain(zhCN.result.primary);
    expect(markup).toContain(zhCN.result.secondary);
  });
});
