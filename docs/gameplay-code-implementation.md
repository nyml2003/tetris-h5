# 口袋方块玩法功能代码实现说明

这份文档解释的是：

- 前一份玩法设计文档里提到的那些规则
- 在当前代码里分别落在哪些模块
- 这些模块之间是怎么协作的

它不是 API 文档，也不是逐行代码注释，而是一份“从功能到代码结构”的导览。

## 1. 整体实现分层

当前项目的玩法实现可以理解成 4 层：

### 1.1 纯规则层

目录：`src/game`

职责：

- 定义棋盘和方块数据
- 决定碰撞、旋转、消行、得分、升级、失败
- 不关心 React，不关心 DOM

核心文件：

- `src/game/types.ts`
- `src/game/constants.ts`
- `src/game/pieces.ts`
- `src/game/tetrisEngine.ts`
- `src/game/tetrisAi.ts`

### 1.2 应用状态层

目录：`src/app`

职责：

- 在“游戏规则状态”外，再包一层“页面状态”
- 管首页、帮助页、游戏页、暂停页、结算页之间的切换
- 决定当前是手动模式还是 AI 模式

核心文件：

- `src/app/tetrisAppState.ts`
- `src/app/useTetrisApp.ts`
- `src/app/tetrisAppViewModel.ts`

### 1.3 输入与时序层

目录：`src/app`

职责：

- 把键盘和触控输入翻译成动作
- 用 `requestAnimationFrame` 驱动自动下落
- 在 AI 模式下持续生成操作序列

核心文件：

- `src/app/tetrisAppKeyboard.ts`
- `src/app/useTetrisKeyboard.ts`
- `src/app/tetrisGameLoop.ts`
- `src/app/useTetrisGameLoop.ts`
- `src/app/useTetrisAutoplay.ts`
- `src/app/usePressRepeat.ts`

### 1.4 视图与渲染层

职责：

- 根据当前状态渲染不同页面
- 把棋盘和下一块预览画到 Canvas
- 负责按钮、信息条、帮助页分页等 UI

核心文件：

- `src/app/App.tsx`
- `src/app/App.css`
- `src/app/useCanvasSurface.ts`
- `src/game/render.ts`

## 2. 数据模型是怎么定义的

### 2.1 棋盘与方块

`src/game/types.ts` 定义了玩法最核心的几个类型：

- `TetrominoType`：7 种方块类型
- `GameStatus`：`idle / running / paused / gameOver`
- `ControlAction`：左移、右移、旋转、软降、直落、暂停、重开
- `GameState`：整局游戏状态

`GameState` 里最重要的字段有：

- `board`：当前棋盘矩阵
- `activePiece`：正在下落的方块
- `nextQueue`：后续出块队列
- `score`
- `level`
- `lines`
- `status`

这意味着游戏规则层不依赖 React state 结构，它只认一个普通对象。

### 2.2 应用级状态

`src/app/tetrisAppState.ts` 又在 `GameState` 外层定义了 `AppState`：

- `playerMode`：`manual` 或 `ai`
- `screen`：当前页面
- `settingsSource`：暂停页来自首页还是游戏页
- `helpPage`：帮助页当前页码
- `game`：内嵌的 `GameState`

这一步很关键，因为项目不是“只有一个棋盘页面”，而是一个包含多页面流转的小游戏应用。

## 3. 方块、出块与旋转是怎么实现的

### 3.1 方块形状

`src/game/pieces.ts` 直接把 7 种方块的 4 个旋转形态写成坐标表。

例如：

- `I_SHAPE`
- `O_SHAPE`
- `T_SHAPE`

然后通过：

- `getRotationCells(kind, rotation)`
- `getPieceCells(piece)`

把“方块类型 + 旋转状态 + 世界坐标”转换成真正落在棋盘上的单元格坐标。

### 3.2 出生位置

`createSpawnPiece(kind)` 把新方块生成在：

- `x: 3`
- `y: -1`

这里把方块放在棋盘上方一行，能让部分方块从可视区外进入，手感更接近经典俄罗斯方块。

### 3.3 7-bag 出块

`createShuffledBag()` 会：

- 先拿到 `["I", "O", "T", "S", "Z", "J", "L"]`
- 再做一次洗牌

`tetrisEngine.ts` 里的 `refillQueue()` 会不断补齐队列，确保出块序列始终按包生成，而不是纯随机无限抽样。

## 4. 下落、碰撞、锁定是怎么实现的

### 4.1 碰撞检测

`src/game/tetrisEngine.ts` 里的 `hasCollision(board, piece)` 是玩法判断的基础。

它会检查：

- 方块是否撞到左右边界
- 是否撞到底部
- 是否撞到已经落地的格子

这是移动、旋转、自然下落、软降、直落都会复用的核心判断。

### 4.2 自动下落

自动下落拆成两层：

- `src/app/tetrisGameLoop.ts` 负责根据时间差计算本帧应该掉几格
- `src/app/useTetrisGameLoop.ts` 用 `requestAnimationFrame` 持续驱动它

具体过程是：

1. `advanceGameLoop()` 读取上次帧时间和累计时间
2. 根据 `level` 调用 `getDropIntervalMs(level)`
3. 算出当前应该触发多少次 `tick`
4. `useTetrisGameLoop()` 再按次数 `dispatch({ type: "tick" })`

真正让方块下降一格的是 `tetrisEngine.ts` 里的 `stepGame(state)`。

### 4.3 锁定与生成下一块

`stepGame()` 发现下一格会碰撞时，不是继续移动，而是调用 `settlePiece(state)`。

`settlePiece()` 会做 4 件事：

1. 把当前活动方块合并进棋盘
2. 清掉完整的行
3. 更新分数、等级、消行数
4. 从队列里生成下一个活动方块

也就是说，落地结算是在一个纯函数里一次性完成的。

## 5. 消行、得分、升级是怎么实现的

### 5.1 消行

`clearCompletedLines(board)` 会：

- 过滤掉“全部被占满”的行
- 统计清掉了多少行
- 在顶部补回同样数量的空行

这正是经典俄罗斯方块的消行实现方式。

### 5.2 得分

`settlePiece()` 里会根据清除行数计算：

- `LINE_CLEAR_SCORES[clearedLines] * state.level`

`constants.ts` 里当前定义的是：

- 1 行 `100`
- 2 行 `300`
- 3 行 `500`
- 4 行 `800`

此外主动下落还会加分：

- `softDrop` 每前进 1 格加 `1`
- `hardDrop` 每前进 1 格加 `2`

这部分逻辑在 `applyAction()` 里处理。

### 5.3 升级与速度

升级规则在 `computeLevel(lines)`：

- 每 10 行升 1 级

速度规则在 `constants.ts` 的 `getDropIntervalMs(level)`：

- 基础间隔 `860ms`
- 每升一级减 `65ms`
- 下限 `120ms`

这样规则层和时序层就分开了：

- 规则层只负责更新 `level`
- 时序层根据 `level` 决定 tick 节奏

## 6. 旋转 kick 是怎么做的

`tetrisEngine.ts` 的 `rotatePiece(state)` 不会只尝试“原地旋转一次”。

它会按 `ROTATION_KICKS` 里的顺序尝试多个候选位置：

- 原地
- 左 1 / 右 1
- 左 2 / 右 2
- 上 1

只要有一个候选位置不碰撞，就接受这次旋转。

这就是当前项目的简化 kick 方案。它不追求完整标准系统，但能明显改善靠墙和贴堆叠边缘时的旋转手感。

## 7. 失败条件是怎么判定的

失败主要有两种入口，都是在 `settlePiece()` 之后出现：

### 7.1 顶出可视区

`mergePieceIntoBoard()` 在合并方块时，如果某个格子 `y < 0`，会记下 `toppedOut = true`。

这表示方块锁定时仍有部分停留在棋盘顶端之外。

### 7.2 新生方块被堵住

`spawnNextActivePiece()` 生成下一块以后，会立刻用 `hasCollision()` 判断出生点是否已被占住。

如果是，就把 `gameOver` 设为 `true`。

最终 `settlePiece()` 根据这两种情况决定是否把状态切到 `gameOver`。

## 8. 输入是怎么接入规则层的

### 8.1 键盘映射

`src/app/tetrisAppKeyboard.ts` 负责把键盘码翻译成应用动作。

它会区分不同页面：

- 首页
- 帮助页
- 设置页
- 结算页
- 游戏页

例如：

- 首页 `Enter` -> `start`
- 帮助页 `KeyA` -> `startAi`
- 游戏页 `ArrowLeft` -> `control:left`
- 游戏页 `Escape` -> `openSettings`

这层的意义是：键盘先被解释成“应用意图”，而不是直接操作 DOM。

### 8.2 键盘订阅

`src/app/useTetrisKeyboard.ts` 把这个映射挂到 `window.addEventListener("keydown", ...)` 上。

如果按键属于方向键或空格，还会先 `preventDefault()`，避免页面滚动干扰游戏。

### 8.3 触控按钮

`App.tsx` 里的底部控制按钮直接调用：

- `app.moveLeft()`
- `app.rotate()`
- `app.moveRight()`
- `app.softDrop()`
- `app.hardDrop()`

这些函数最终都会在 `useTetrisApp()` 里变成 `dispatch({ type: "control", control })`。

### 8.4 按住连发

`ControlButton` 会用 `usePressRepeat()`。

这让左右移动和软降这类操作支持：

- 按下触发一次
- 按住后按固定延迟和间隔持续触发

从玩法角度看，这是移动端触控手感成立的关键补丁。

## 9. App 状态机是怎么包住玩法的

### 9.1 Reducer 是总入口

`src/app/tetrisAppState.ts` 的 `reduceAppState()` 是整套应用的总状态机。

它接收两类事情：

- 页面流转动作，比如 `openHelp`、`goHome`
- 游戏动作，比如 `tick`、`control`

当 action 和棋盘规则有关时，它会委托给纯规则层：

- `stepGame(state.game)`
- `applyAction(state.game, action.control)`
- `togglePause(state.game)`
- `beginGame(state.game)`

### 9.2 为什么这么设计

这样拆之后：

- 棋盘规则保持纯净
- 页面逻辑不会污染引擎
- React 组件只和 `useTetrisApp()` 暴露的接口交互

这是项目当前结构最重要的解耦点。

## 10. `useTetrisApp()` 是怎么组织各部分的

`src/app/useTetrisApp.ts` 可以看成应用层的组合根。

它做了几件事：

1. 用 `useReducer(reduceAppState, ..., createInitialAppRouteState)` 建立状态
2. 挂上几个副作用 hook：
   - `useTetrisGameLoop`
   - `useTetrisAutoplay`
   - `useTetrisKeyboard`
   - `useAppRouteSync`
3. 调用 `tetrisAppViewModel.ts` 里的 selector，把原始状态整理成 UI 更容易消费的数据
4. 暴露一组 UI 可以直接调用的方法给 `App.tsx`

所以 `useTetrisApp()` 的角色不是“实现规则”，而是“把规则、页面和副作用组装成一个可用的应用接口”。

## 11. AI 模式是怎么实现的

### 11.1 入口

AI 模式本质上只是把：

- `playerMode` 设成 `ai`
- 正常开始一局游戏

对应 action 是 `startAi`。

### 11.2 自动操作循环

`src/app/useTetrisAutoplay.ts` 会在满足下面条件时启动：

- `playerMode === "ai"`
- 当前页是 `game`
- `game.status === "running"`

然后每一帧：

1. 调用 `planAiMove(state.game)`
2. 拿到一串动作计划
3. 截取前 `AI_ACTIONS_PER_FRAME = 4` 个动作
4. 依次派发 `control` action

所以 AI 不是“直接改棋盘”，而是像玩家一样，通过同一套控制动作驱动引擎。

### 11.3 AI 决策

`src/game/tetrisAi.ts` 的核心思路是：

- 枚举当前活动方块在不同旋转和横向位置下的可能落点
- 对每个落点先模拟一次 `hardDrop`
- 再用 `evaluateBoard()` 给结果打分

评分函数主要考虑：

- 清了多少行
- 总高度
- 最高列高度
- 洞的数量
- 地形起伏程度

所以 AI 的偏好是“稳定和整洁”，不是炫技。

### 11.4 人工接管

当玩家在 AI 对局里暂停后，`takeOver` action 会：

- 把 `playerMode` 改回 `manual`
- 回到游戏页
- 把暂停状态恢复成 `running`

同时 `tetrisAppViewModel.ts` 会让按钮重新可用，提示文案也从 AI 提示切回手动提示。

## 12. 为什么 AI 模式下手动方向键会失效

这件事不是在引擎里做的，而是在输入映射层做的。

`tetrisAppKeyboard.ts` 里，当当前页面是游戏页且 `state.playerMode === "ai"` 时：

- `ArrowLeft`
- `ArrowRight`
- `ArrowUp`
- `ArrowDown`
- `Space`

这些控制不会再被翻译成玩家动作。

这样能保证：

- AI 的动作流不会和玩家输入打架
- 接管必须通过暂停页显式切模式完成

## 13. Canvas 是怎么把状态画出来的

### 13.1 为什么不用 JSX 画棋盘

棋盘是高频更新区域，如果每次都走 React 组件树：

- 更新成本更高
- 容易让 UI 结构和绘制细节耦合

所以项目把棋盘和预览都交给 Canvas。

### 13.2 `useCanvasSurface()`

`src/app/useCanvasSurface.ts` 的职责是：

- 接收一个值，比如 `gameState` 或 `nextPiece`
- 当这个值变化时，在下一帧重新绘制 Canvas
- 当 Canvas 尺寸变化时，也重绘一次

它不关心画什么，只关心“什么时候请求一次安全的 Canvas 绘制”。

### 13.3 `drawGameBoard()`

`src/game/render.ts` 的 `drawGameBoard(canvas, state)` 会按顺序绘制：

1. 背景
2. 网格
3. 已落地的格子
4. 幽灵方块
5. 当前活动方块

其中幽灵方块来自 `getGhostPiece(state)`，所以渲染层并不自己推导落点，而是复用规则层的结果。

### 13.4 `drawPreview()`

下一块预览也是同一套思路：

- 先画一个 4x4 预览区域
- 再把下一个方块按其旋转形态居中绘制进去

## 14. 页面切换和浏览器路由是怎么对应的

### 14.1 路由到状态

`src/app/appRoute.ts` 负责把 URL 翻译成初始状态：

- `/` -> 首页
- `/help` -> 帮助页
- `/play` -> 新的一局游戏
- `/result` -> 结算页

如果浏览器历史里已经存了完整 `AppState`，会优先恢复那个状态。

### 14.2 状态到路由

`src/app/useAppRoute.ts` 会在状态变化时更新浏览器历史：

- 首次挂载用 `replaceState`
- 页面切换时用 `pushState`
- 同一路径但页面内部状态变了时，比如帮助页翻页，也会刷新当前条目的 `history.state`

所以这个项目不是简单的“点击按钮改 URL”，而是保持：

- URL
- 页面状态
- 浏览器前进后退

三者同步。

这也是为什么帮助页翻页后，用浏览器返回还能恢复到之前页码。

## 15. `App.tsx` 最终是怎么把这些拼起来的

`src/app/App.tsx` 本身比较克制，它做的主要是：

- 根据 `app.screen` 选择渲染哪个页面
- 把 `useTetrisApp()` 暴露的方法绑定到按钮
- 把 `gameState` 和 `nextPiece` 交给 Canvas hook
- 计算当前可用空间下棋盘画布该有多大

也就是说：

- 规则不写在组件里
- 键盘事件不写在组件里
- 自动下落不写在组件里
- AI 逻辑也不写在组件里

组件层主要负责“装配”和“展示”。

## 16. 测试是怎么覆盖这些功能的

### 16.1 单元测试

`tests/game` 主要覆盖：

- 引擎行为
- 消行
- 旋转 kick
- 失败条件
- AI 评分和规划

这保证核心玩法规则在不依赖浏览器的情况下可验证。

### 16.2 App / Hook 测试

`tests/app` 主要覆盖：

- 页面流转
- 键盘映射
- 帮助页分页
- AI 开局与接管
- 路由恢复

这部分验证“玩法如何进入页面状态机”。

### 16.3 E2E 测试

`tests/e2e` 主要覆盖：

- 首页、帮助页、游戏页核心链路
- AI 模式与接管
- 布局是否越界或重叠
- 浏览器历史恢复

这部分是从真实用户视角验证“这些功能最终是否在浏览器里成立”。

## 17. 用一句话总结当前实现思路

如果把整套实现浓缩成一句话，可以这样理解：

> 先用纯 TypeScript 引擎把俄罗斯方块规则做成一组可测试的纯函数，再用一个 React reducer 把页面、输入、AI、路由和 Canvas 渲染组织成完整应用。

这个结构的好处是：

- 玩法规则容易测试
- 页面逻辑不会污染引擎
- AI 和玩家共用同一套动作通路
- 后续继续扩展功能时，边界比较清楚

如果后面要新增玩法，通常也可以先问一句：

- 这是该加到 `src/game` 的纯规则里
- 还是该加到 `src/app` 的应用状态和页面流程里

这个判断一旦做对，后续实现会顺很多。
