# Playwright 端到端验收结论

## 当前结论

当前项目的端到端验收建议采用：

- 真实浏览器执行：使用 `Playwright`
- 验收主方式：行为断言 + 结构化布局断言
- 暂不作为主方案：截图型视觉回归

也就是说，首版不以 bitmap screenshot 或截图基线对比为核心，而是重点校验：

- 页面跳转是否正确
- 键盘和点击行为是否正确
- 关键区域是否可见
- 元素是否越界、重叠、溢出
- 棋盘区域是否被顶部和底部操作区过度挤压

## 为什么不把截图作为主方案

`screenshot` 的本质是浏览器真实渲染后的图片比对，适合发现“页面看起来变了”，但不适合为当前项目的主要问题写规则化脚本。

当前项目的核心问题更偏结构和几何：

- `screen-card` 内容高度是否超出
- `help` 页面卡片是否越界
- `game-stage` 是否被顶部和底部区域挤压过多
- 顶栏、底栏、棋盘是否互相重叠
- AI 暂停页按钮区域是否布局异常

这些问题更适合通过结构化断言解决，而不是通过截图比像素解决。

截图方案的缺点：

- 失败时更容易看到“变了”，但不容易直接知道是哪条布局规则被破坏
- 需要维护图片基线
- 文案、字体、平台差异会增加维护噪音
- 对当前这个仍在快速调整布局的项目来说，性价比不高

## 推荐的首版 Playwright 验收方式

### 1. 行为断言

用真实浏览器验证主链路：

- `/` 首页打开正常
- 点击“查看键位”进入 `/help`
- 点击“开始游戏”进入 `/play`
- `H` 打开帮助页
- `Enter` 开始手动对局
- `A` 从帮助页进入 AI 对局
- `Esc` / `P` 在对局中打开暂停页
- AI 模式下手动方向键不生效
- 暂停后可人工接管
- 浏览器前进后退能恢复关键页面状态

### 2. 结构化布局断言

使用 `locator.boundingBox()` 或 `getBoundingClientRect()` 校验：

- 关键元素完整落在 viewport 内
- 容器不发生异常纵向或横向溢出
- 两个关键区域不重叠
- `game-stage` 高度大于顶部区域和底部区域
- `game-stage` 高度占主可视区的比例满足阈值
- `help` 页面双栏卡片不会挤出容器

### 3. 可见性与稳定性断言

补充校验：

- 元素存在且可见
- 按钮 disabled 状态正确
- 分页页码变化正确
- 当前路由与页面状态一致

## 首版建议覆盖页面

### 首页 `/`

验证：

- 首页卡片可见
- 首页动作区可见
- 首页卡片与动作区不重叠
- 首页没有明显纵向溢出
- “开始游戏 / AI 代玩 / 查看键位”三个入口都存在

### 帮助页 `/help`

验证：

- 主说明卡片可见
- 双栏卡片布局成立
- 帮助卡片不越界
- 分页器正常工作
- 上一页 / 下一页按钮状态正确
- 从帮助页能进入手动局、AI 局、返回首页

### 游戏页 `/play`

验证：

- `game-stage` 可见
- 棋盘区域未被顶栏和底栏压缩到异常高度
- 顶栏、数据区、底部控制区不溢出
- 棋盘与底栏不重叠
- 暂停、恢复、AI 接管链路可用

### 暂停页

验证：

- 按钮区可见
- 按钮区与内容区不重叠
- AI 模式下显示接管入口
- 返回首页与继续游戏行为正确

## 首版不做的事情

当前结论下，首版 Playwright 暂不包含：

- 截图基线比对
- 视觉快照平台接入（如 Percy、Applitools）
- 桌面端矩阵优先覆盖
- 通过真实完整对局打到 result 页的复杂自动化

如后续页面结构趋稳，再考虑引入少量截图回归作为补充，而不是主方案。

## 建议的测试目录结构

```text
tests/
  e2e/
    home.spec.ts
    help.spec.ts
    game.spec.ts
    helpers/
      layout.ts
      routes.ts
```

说明：

- `home.spec.ts`：首页入口和首页布局
- `help.spec.ts`：帮助页双栏、分页、入口流转
- `game.spec.ts`：棋盘高度占比、暂停、AI 接管
- `helpers/layout.ts`：Rect、overflow、overlap 断言
- `helpers/routes.ts`：公共导航动作与常用 locator

## 建议的断言 helper

建议封装以下 helper：

- `expectInViewport(locator)`
- `expectNoVerticalOverflow(locator)`
- `expectNoHorizontalOverflow(locator)`
- `expectNoOverlap(locatorA, locatorB)`
- `expectHeightGreater(locatorA, locatorB)`
- `expectHeightRatio(locator, minRatio)`

这些 helper 的目标不是抽象业务，而是复用几何规则，让失败信息可读。

## 当前仓库状态说明

当前仓库已经引入了 `@playwright/test` 到 `devDependencies`，后续可在此基础上继续补：

- `playwright.config.ts`
- `test:e2e` 相关脚本
- `tests/e2e` 用例
- 必要的稳定选择器（如 `data-testid`）

## 文档用途

这份文档用于明确一个方向性结论：

> 本项目首版 Playwright 端到端验收，采用真实浏览器 + 行为断言 + Rect/overflow 结构化布局断言；不把 screenshot 视觉回归作为主方案。
