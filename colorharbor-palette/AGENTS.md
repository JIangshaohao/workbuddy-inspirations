# AGENTS.md — ColorHarbor 配色收藏库

## 项目简介

单文件纯前端网站：**暗色画廊**风格的配色收藏库。30 组配色在 Masonry 墙上像艺术品一样被「裱」起来，支持分类过滤、随机发现、收藏抽屉、详情态 UI 预览与一键复制色值。

## 技术栈

- 语言：HTML5 + CSS3（CSS 变量 / Grid / 多列布局 / `backdrop-filter` / `@keyframes`）
- 交互：原生 JavaScript（无框架、无 jQuery、无构建工具）
- 字体：Inter（标题）+ Geist Mono（等宽色值），通过 Google Fonts 在线加载，**离线自动回退系统字体栈**
- 依赖：**零依赖**，双击 `index.html` 即可运行

## 目录结构

```
colorharbor-palette/
├── AGENTS.md             # 本文件
├── README.md             # 项目说明
├── MEMORY.md             # 长期上下文
├── index.html            # 全部内容：样式 + 结构 + 30 组数据 + 交互脚本
├── preview-gallery.png   # 首屏画廊预览图（README 用）
└── preview-detail.png    # 详情态预览图（README 用）
```

单文件是刻意选择：灵感要能「一个文件丢给别人就打开」。

## 运行 / 构建方式

直接用浏览器打开 `index.html`。本地无构建、无打包。

若需在本地 HTTP 下测试剪贴板 API（`navigator.clipboard` 在 `file://` 下受限）：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000/index.html
```

## 编码约定

- **设计 token 全部集中在 `:root`**：`--bg`、`--surface`、`--accent`、`--text`、`--hairline`、`--font-sans`、`--font-mono`、`--ease`。改主题只动这一处。
- **配色数据是唯一数据源**：所有卡片、详情、抽屉均由 `PALETTES` 数组驱动，禁止在 HTML 里手写色块。新增配色只需往 `PALETTES` 追加一条。
- **类别标签由 `CATEGORIES` 驱动**，计数在运行时统计，禁止硬编码数量。
- **颜色工具函数**：`hexToRgb` / `rgba` / `rgbToHex` / `idealText`（自动黑字或白字）/ `readable`（保色相提亮，保证深色面板上的可读对比度）。
- **命名**：DOM id 用驼峰（`detailGrid`），CSS 类用连字符（`.color-block`、`.ui-btn-solid`），数据用 `kebab-case` id（`grad-01`）。
- **动效统一缓动**：`--ease: cubic-bezier(0.16, 1, 0.3, 1)`，不要引入其它曲线。
- 新增 UI 预览组件时必须同时补充：组件类、在 `buildDetail()` 中的注入、以及必要的 `readable()` 提亮处理。

## 注意事项

- **剪贴板是双路径**：`navigator.clipboard` 优先，失败回退 `textarea + execCommand`。`execCommand` 已废弃但**不能删**——它是 `file://` 或非 HTTPS 下唯一可用的兜底。
- **预览区色值必须过 `readable()`**：像 `Ocean Deep` 的 `#03045E`、`#001F3F` 这类极暗色直接当文字色会与深色面板糊在一起。凡是「文字 / 描边 / 评分星」用途的色值都要提亮，色块本身（大色板、列表圆点）保持**真实色值**不变。
- **入场动画用 `animation-fill-mode: backwards`，不要用 `both`**：`both` 会把结束帧的 `transform` 永久钉住，导致卡片 hover 放大失效。
- **Masonry 用 CSS `columns`**，卡片依赖 `break-inside: avoid`。卡片高度由 `p.h` 预计算（由 id 哈希生成），保证过滤/重渲染时高度稳定、不跳动。
- **详情浮层靠 `visibility` + `opacity` 双属性切换**，仅切 `opacity` 会让隐藏态仍可被 Tab 聚焦。
- **无头截图注意**：CSS 过渡在 headless 的 `--virtual-time-budget` 下不一定会走完，验证终态请先注入脚本冻结 `transition/opacity/transform`，或加 `--force-prefers-reduced-motion`（本项目已支持 `prefers-reduced-motion`）。
- 保持单文件，不要拆分 CSS/JS。
