import type { TetrominoType } from "@/game/types";

export const pieceLabels: Record<TetrominoType, string> = {
  I: "I",
  O: "O",
  T: "T",
  S: "S",
  Z: "Z",
  J: "J",
  L: "L",
};

export const zhCN = {
  brand: "口袋方块",
  hud: {
    score: "分数",
    lines: "消行",
    level: "等级",
    next: "下一块",
  },
  home: {
    tag: "单屏 H5",
    title: "俄罗斯方块",
    subtitle: "打开即玩，当前设备竖屏内不滚动。",
    primary: "开始游戏",
    ai: "AI 代玩",
    secondary: "操作与设置",
    bullets: [
      "左移 / 右移：调整落点",
      "旋转：快速寻找缝隙",
      "加速 / 直落：提节奏抢清行",
    ],
  },
  game: {
    status: "进行中",
    pause: "暂停",
    keyboard: "键盘也可用：方向键移动，空格直落。",
    aiHint: "AI 正在光速代打，手动移动已锁定。",
    aiBadge: "AUTO / TURBO x4",
  },
  settings: {
    title: "暂停 / 设置",
    subtitle: "当前版本先把单屏体验和手感做稳，不上完整 i18n。",
    items: [
      { label: "语言", value: "简体中文资源表" },
      { label: "操作", value: "触控按钮 + 键盘映射" },
      { label: "布局", value: "设备视口内单屏显示" },
    ],
    mode: "模式",
    manualMode: "手动",
    aiMode: "AI 代玩",
    resume: "继续游戏",
    takeOver: "人工接管",
    start: "开始新局",
    restart: "重新开始",
    home: "返回首页",
  },
  result: {
    tag: "本局结束",
    title: "棋盘锁死了",
    subtitle: "换一局继续冲分，尽量把中间留给长条。",
    primary: "再来一局",
    secondary: "回到首页",
  },
  controls: {
    left: "左移",
    rotate: "旋转",
    right: "右移",
    softDrop: "加速",
    hardDrop: "直落",
    pause: "暂停",
  },
} as const;