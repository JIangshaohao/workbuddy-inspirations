# AGENTS.md — vesper-ai-landing

## 项目简介

单视口视频背景落地页复刻：全屏 CloudFront 背景视频上叠加白胶囊导航、点阵标题 Hero 与四项统计区，桌面锁一帧、移动端汉堡菜单。

## 技术栈

- 语言/框架：原生 HTML + CSS + Vanilla JS，零构建。
- 依赖（全部 CDN，联网必需）：Inter（Google Fonts）、BubbledotICG-FinePos（OnlineWebFonts）、Font Awesome 6.5.2（cdnjs，带 integrity）。
- 本地资源：`assets/logo.webp`（Pillow 生成的品牌标记）、`fonts/GeistPixel-Circle.woff2`（Geist Pixel 兜底展示字体）。

## 目录结构

```
vesper-ai-landing/
├── index.html      # 页面结构与三处 CDN 引用
├── styles.css      # 全部样式：变量、三段布局、动效、移动端菜单、reduced-motion
├── main.js         # 数字滚动（IntersectionObserver）+ 移动端菜单交互
├── assets/logo.webp
├── fonts/GeistPixel-Circle.woff2
└── _preview_*.png  # 无头 Chrome 验证截图（仅存档，非运行时依赖）
```

## 运行方式

双击 `index.html` 即可。**必须联网**：背景视频、三个字体/图标样式表均来自外部 CDN，离线时视频黑屏、标题回退到 Geist Pixel Circle。

## 编码约定

- 展示字体栈：`"BubbledotICG-FinePos", "Geist Pixel Circle", monospace`；UI 字体栈：`"Inter", "Segoe UI", system-ui, sans-serif`。
- CSS 变量名沿用规格（`--trust-*` / `--pill-dark` 等），勿重命名。
- 文案为英文（页面本身面向英文语境），注释中文。

## 注意事项

- 菜单 sheet 用 `hidden` 属性控制显隐，媒体查询内 `display:flex` 会覆盖 `[hidden]`，已加 `[hidden]{display:none!important}`，勿删。
- 副标题不可加 `white-space:pre-line`，会把源码折行变成强制换行（3 行变体，规格要求自然 2 行）。
- 标题要求纯色白，严禁加渐变/扫光。
