# AGENTS.md — CSS 加载动画合集

## 项目简介

一个单文件的纯 CSS 加载动画合集，展示 8 种可直接复用的 Loading 效果，并提供「复制 CSS」一键取用。

## 技术栈

- 语言：HTML5 + 纯 CSS（CSS 变量 / `@keyframes` / `conic-gradient`）
- 交互：原生 JavaScript（无框架、无 jQuery、无构建工具）
- 依赖：**零依赖**，双击 `index.html` 即可运行
- 运行环境：任意现代浏览器

## 目录结构

```
css-loading-animations/
├── AGENTS.md      # 本文件
├── README.md      # 项目说明
├── MEMORY.md      # 长期上下文
└── index.html     # 全部内容：样式 + 8 个动画 + 复制脚本
```

单文件设计是刻意选择：灵感类项目要能「一个文件丢给别人就能看」，不引入目录结构和构建链。

## 运行方式

直接用浏览器打开 `index.html`。

若需本地服务器（例如测试剪贴板 API）：

```bash
# 任选其一
python -m http.server 8000
npx serve .
```

## 编码约定

- **主题变量集中在 `:root`**：`--bg`、`--card-top`、`--stage`、`--text`、`--muted` 等，改配色只动这一处。
- **每个动画用 CSS 变量传参**：卡片通过 `style="--c:…;--c2:…;--glow:…;--accent:…"` 注入主色、副色、辉光色、强调色。
- **动画类名前缀 `ld-`**（loader）：如 `.ld-ring`、`.ld-dots`、`.ld-bars`。
- **`@keyframes` 命名用驼峰**：如 `ldDnaA`、`ldDnaB`。
- 新增动画必须同时提供：`ld-*` 结构类、`@keyframes`、`data-anim` 标识、卡片中的「复制 CSS」按钮。

## 注意事项

- 剪贴板复制走了「`navigator.clipboard` 优先 + `textarea + execCommand` 兜底」的双路径。**`execCommand` 已废弃但不删除**——它是 `file://` 或非 HTTPS 环境下唯一可用的兜底方案，删除会导致本地双击打开时复制失效。
- 骨架屏（`skeleton`）与 DNA 双螺旋（`dna`）依赖 `--c2` 副色，新增卡片时若省略 `--c2` 会退化为单色渐变。
- 保持单文件，不要拆分 CSS/JS。
