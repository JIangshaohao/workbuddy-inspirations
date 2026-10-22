# MEMORY.md — Asme Liquid Glass 落地页

## 长期上下文
- 这是对一份 RECREATION 规格（React + TypeScript + Vite + Tailwind + framer-motion + lucide-react）的**纯静态单文件复刻**。
- 用户明确「更偏向静态网页」，故放弃 React 构建链，与 `velorah-hero-landing`、`lumina-liquid-glass-footer` 同路。

## 架构决策
- 决策：单文件 `index.html` + Tailwind Play CDN ｜ 原因：用户偏好静态、零构建；规格本身就是 Tailwind class，可直接复用 ｜ 影响：需联网加载 Tailwind CDN
- 决策：渐入动效用 IntersectionObserver 复刻 framer-motion `useInView` ｜ 原因：纯静态无框架 ｜ 影响：语义等价，`margin: -100px` 用 `rootMargin: '0px 0px -100px 0px'` 近似
- 决策：图标用内联 SVG（Lucide 路径）｜ 原因：Lucide CDN 已移除品牌图标（Instagram/Twitter）｜ 影响：无图标外链依赖

## 踩坑记录
- `.reveal.in { transform: none }` 会压制同元素 hover 变换，故卡片 hover 缩放放在内部视频的 `group-hover:scale-105` 上，不放在 `.reveal` 卡片本身。

## 用户纠正 / 偏好
- 用户明确「更偏向静态网页」，即使规格要求 React + Vite。
- 新建灵感必须独立文件夹 + 三件套（AGENTS/README/MEMORY）。

## 外部资源
- 视频：CloudFront（规格提供，5 个 mp4，见 `index.html` 内 `src`）。
- 字体：Google Fonts Instrument Serif（regular + italic）。
