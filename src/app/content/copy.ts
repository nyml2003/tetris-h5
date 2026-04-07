import type { TetrominoType } from "@/game/core/types";

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
    tag: "",
    title: "俄罗斯方块",
    subtitle: "打开即玩，开局、对局和暂停都留在一屏里。",
    primary: "开始游戏",
    ai: "AI 代玩",
    secondary: "查看键位",
    bullets: [
      "左移 / 右移：调整落点",
      "旋转：快速寻找缝隙",
      "加速 / 直落：提节奏抢清行",
    ],
  },
  help: {
    tag: "操作说明",
    title: "键位与交互",
    subtitle: "把键盘、触控和 AI 接管方式拆成卡片，翻页就能快速看完。",
    primary: "开始游戏",
    ai: "AI 代玩",
    home: "返回首页",
    previous: "上一页",
    next: "下一页",
    hint: "键盘：Enter 开始，A 启动 AI，Esc 返回首页。",
    sections: [
      {
        title: "移动与落子",
        description: "键盘基础操作",
        items: [
          { key: "← / →", value: "左右移动" },
          { key: "↑", value: "旋转当前方块" },
          { key: "↓", value: "加速下落" },
          { key: "Space", value: "直接落下" },
        ],
      },
      {
        title: "流程控制",
        description: "局内快捷键",
        items: [
          { key: "P / Esc", value: "暂停当前对局" },
          { key: "R", value: "重新开局" },
          { key: "Enter", value: "从首页或帮助页直接开一局" },
        ],
      },
      {
        title: "触屏按钮",
        description: "底部操作区",
        items: [
          { key: "左移 / 右移", value: "支持按住连续触发" },
          { key: "旋转 / 直落", value: "高频操作单独强调" },
          { key: "暂停", value: "可从底部或顶部进入" },
        ],
      },
      {
        title: "AI 代玩",
        description: "代打与接管",
        items: [
          { key: "AI 代玩", value: "从首页直接进入自动模式" },
          { key: "P / Esc", value: "暂停后可人工接管" },
          { key: "接管后", value: "原局面保留，直接切回手动" },
        ],
      },
      {
        title: "界面信息",
        description: "抬头数据区",
        items: [
          { key: "分数", value: "软降和消行都会增长" },
          { key: "消行 / 等级", value: "决定节奏变化" },
          { key: "下一块", value: "右上角实时预览" },
        ],
      },
      {
        title: "浏览方式",
        description: "帮助页翻阅",
        items: [
          { key: "双栏布局", value: "每页两列卡片并排查看" },
          { key: "上一页 / 下一页", value: "内容变多时分页浏览" },
          { key: "浏览器返回", value: "可回退到上一页状态" },
        ],
      },
    ],
  },
  game: {
    status: "进行中",
    pause: "暂停",
    keyboard: "键盘可用：← → 移动，↑ 旋转，↓ 加速，Space 直落，P / Esc 暂停，R 重开。",
    aiHint: "AI 正在代打，手动移动已锁定；按 P 或 Esc 可暂停并接管。",
    aiBadge: "AUTO / TURBO x4",
  },
  settings: {
    title: "暂停 / 设置",
    subtitle: "",
    items: [
      { label: "语言", value: "简体中文" },
      { label: "操作", value: "触控 + 键盘" },
      { label: "版式", value: "棋盘优先" },
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

