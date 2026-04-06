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
    copy: zhCN,
    gameState,
    goHome: vi.fn(),
    hardDrop: vi.fn(),
    isGameScreen: false,
    isPlayable: false,
    leaveSettings: vi.fn(),
    moveLeft: vi.fn(),
    moveRight: vi.fn(),
    nextPiece: "I",
    openGameSettings: vi.fn(),
    openHomeSettings: vi.fn(),
    playAgain: vi.fn(),
    rotate: vi.fn(),
    screen: "home",
    settingsFromGame: false,
    settingsSource: "home",
    softDrop: vi.fn(),
    startGame: vi.fn(),
    summaryStats: [
      { label: zhCN.hud.score, value: "0" },
      { label: zhCN.hud.lines, value: "0" },
      { label: zhCN.hud.level, value: "1" },
    ] as const,
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

  it("renders the home screen actions and copy", () => {
    mockUseTetrisApp.mockReturnValue(createMockApp());

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain(zhCN.home.title);
    expect(markup).toContain(zhCN.home.primary);
    expect(markup).toContain(zhCN.home.secondary);
  });

  it("renders the gameplay screen with stats, preview, and controls", () => {
    mockUseTetrisApp.mockReturnValue(
      createMockApp({
        isGameScreen: true,
        isPlayable: true,
        screen: "game",
      })
    );

    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain(zhCN.game.status);
    expect(markup).toContain(pieceLabels.I);
    expect(markup).toContain(zhCN.controls.left);
    expect(markup).toContain(zhCN.controls.hardDrop);
  });

  it("switches the primary settings action based on where settings were opened", () => {
    mockUseTetrisApp.mockReturnValue(
      createMockApp({
        screen: "settings",
        settingsFromGame: true,
        settingsSource: "game",
      })
    );

    const resumeMarkup = renderToStaticMarkup(<App />);

    mockUseTetrisApp.mockReturnValue(
      createMockApp({
        screen: "settings",
      })
    );

    const startMarkup = renderToStaticMarkup(<App />);

    expect(resumeMarkup).toContain(zhCN.settings.resume);
    expect(startMarkup).toContain(zhCN.settings.start);
    expect(startMarkup).toContain(zhCN.settings.restart);
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
