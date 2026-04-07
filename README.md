# 口袋方块

一个移动端 H5 俄罗斯方块项目，使用 React 19、TypeScript、原生 CSS 和 Canvas 实现。当前版本重点是：

- 当前设备竖屏内单屏显示，不依赖页面滚动
- 四屏结构：首页、游戏页、暂停/设置页、结算页
- 视图层和逻辑层解耦，主逻辑集中在 hook，画布绘制单独走 Canvas hook
- 文案集中在中文资源表，暂不上完整 i18n 框架

## 运行命令

- `pnpm dev`：启动本地开发
- `pnpm build`：类型检查并构建产物
- `pnpm preview`：预览生产构建
- `pnpm lint`：运行 ESLint
- `pnpm typecheck`：运行 TypeScript 检查
- `pnpm test`：运行测试

## 操作方式

- 触控按钮：左移、右移、旋转、加速、直落、暂停
- 键盘映射：
  - `ArrowLeft` / `ArrowRight`：移动
  - `ArrowUp`：旋转
  - `ArrowDown`：加速下落
  - `Space`：直落
  - `Enter`：开始或继续
  - `P` / `Escape`：打开暂停与设置
  - `R`：重新开始

## 目录说明

- `src/app/shell`：应用壳、页面结构和样式入口
- `src/app/content`：中文文案和展示文案映射
- `src/app/routing`：URL 与 history 同步
- `src/app/hooks`：React hooks 协调层
- `src/app/state`：状态机、键盘映射、view-model 和纯逻辑
- `src/game/core`：方块规则、类型、常量和引擎
- `src/game/ai`：AI 代玩决策
- `src/game/rendering`：Canvas 绘制
- `tests/app`：按 `shell / hooks / state` 镜像应用层测试
- `tests/game`：按 `core / ai / rendering` 镜像游戏层测试

## 设计说明

- 业务逻辑仍然复用纯 TypeScript 游戏引擎，便于测试。
- React 主要负责页面切换、按钮绑定和低频状态展示。
- 高频棋盘绘制不走组件树拼 JSX，而是交给 Canvas hook 调度。
