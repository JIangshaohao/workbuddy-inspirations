# AGENTS.md — Asme Liquid Glass 落地页

## 项目简介
一个「液态玻璃」风格的品牌落地页，忠实还原 RECREATION 规格（React + Vite + Tailwind + framer-motion + lucide-react 的视觉），以纯静态单文件实现。

## 技术栈
- 语言/框架：原生 HTML + CSS + 原生 JS（零构建、零依赖包）
- 样式：Tailwind Play CDN + 少量自定义 CSS（液态玻璃、滚动渐入、径向渐变）
- 动效：IntersectionObserver 滚动渐入 + requestAnimationFrame 视频淡入淡出
- 图标：内联 SVG（Lucide 路径；Instagram/Twitter 品牌图标因 Lucide 已移除而内联）
- 字体：Google Fonts `Instrument Serif`（regular + italic）
- 媒体：CloudFront 外部视频（规格提供，不做本地生成）

## 目录结构
- `index.html` —— 单文件入口，结构、样式、脚本全部内联

## 运行 / 构建方式
无需构建。双击 `index.html` 打开，或起任意静态服务器：

```
python -m http.server 8000
```

## 编码约定
- 单文件，无构建链。
- 液态玻璃效果统一用 `.liquid-glass` 类。
- 滚动渐入统一用 `.reveal` + `data-y` / `data-x` / `data-duration` / `data-delay`。
- 视频淡入淡出用原生 rAF，不依赖 CSS transition。

## 注意事项
- 页面需联网（Tailwind CDN、Google Fonts、CloudFront 视频）。
- `.reveal.in` 会重置 `transform`；若某元素还需 hover 变换，hover 应作用在其内部子元素上（如卡片视频的 `group-hover:scale-105`），不要挂在 `.reveal` 元素本身。
