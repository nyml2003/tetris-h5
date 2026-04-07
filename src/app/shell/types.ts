import type { CSSProperties, RefObject } from "react";

export interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export interface ControlButtonProps {
  label: string;
  onPress: () => void;
  repeat?: boolean;
  disabled?: boolean;
  accent?: boolean;
}

export interface HelpSectionItem {
  key: string;
  value: string;
}

export interface HelpSection {
  title: string;
  description: string;
  items: readonly HelpSectionItem[];
}

export interface ScreenStat {
  label: string;
  value: string;
}

export interface SettingsItem {
  label: string;
  value: string;
}

export interface GameControl {
  key: string;
  label: string;
  onPress: () => void;
  repeat?: boolean;
  accent?: boolean;
}

export interface HomeScreenProps {
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

export interface HelpScreenProps {
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

export interface GameScreenProps {
  title: string;
  pauseLabel: string;
  modeBadge: string | null;
  keyboardHint: string;
  stats: readonly ScreenStat[];
  nextLabel: string;
  nextPiece: string;
  onPause: () => void;
  boardCanvasRef: RefObject<HTMLCanvasElement | null>;
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  boardStyle: CSSProperties | undefined;
  controlsDisabled: boolean;
  controls: readonly GameControl[];
}

export interface SettingsScreenProps {
  title: string;
  subtitle?: string;
  items: readonly SettingsItem[];
  primaryLabel: string;
  takeOverLabel?: string;
  restartLabel: string;
  homeLabel: string;
  onPrimary: () => void;
  onTakeOver?: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export interface ResultScreenProps {
  tag: string;
  title: string;
  subtitle: string;
  stats: readonly ScreenStat[];
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}
