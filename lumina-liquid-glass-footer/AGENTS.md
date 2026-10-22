# AGENTS.md — LUMINA 液态玻璃落地页

## 项目简介

单视口沉浸式落地页：全屏 CloudFront 视频背景 + 液态玻璃（liquid glass）页脚，演示「视频背景之上叠加高反光玻璃卡片」的视觉语言。

## 技术栈

- 形态：纯静态单文件网页，**无构建步骤**，双击 `index.html` 即可运行
- 样式：Tailwind CSS v4（浏览器版 CDN `@tailwindcss/browser@4`），通过 `<style type="text/tailwindcss">` 声明 `@theme` 与自定义工具类
- 字体：Helvetica Regular（onlinewebfonts CDN），经 `@theme { --font-sans }` 设为根字体
- 图标：Lucide（UMD CDN，`lucide.createIcons()`）；品牌类图标用内联 SVG
- 动画：纯 CSS keyframes，复刻原规格的 motion 入场参数
- 素材：CloudFront 背景视频（远端 URL，规格指定）

## 目录结构

```
lumina-liquid-glass-footer/
├── index.html      # 全部内容：结构、样式、动画、脚本
├── AGENTS.md
├── README.md
└── MEMORY.md
```

## 运行 / 构建方式

无构建。直接用浏览器打开 `index.html`；需联网（Tailwind / Lucide / 字体 / 视频均为 CDN 资源）。

## 编码约定

- 页面主容器使用 `min-h-[115vh]`，视频层 `fixed inset-0 z-[0]`，内容层 `relative z-10`，遮罩层 `z-[1]`。
- 自定义 CSS 类只写 `liquid-glass`（玻璃边框效果）与动画类，其余样式全部走 Tailwind 原子类。
- 玻璃边框依赖 `mask-composite: exclude` + `padding: 1.4px`，**不可改成 `border`**，否则渐变描边失效。
- 动画只动 `opacity` / `transform`，不动画 `width`/`height`/`margin`。
- 所有动画必须包在 `@media (prefers-reduced-motion: reduce)` 的降级分支里。
- 页面文案使用英文（面向国际读者），注释与文档使用中文。

## 注意事项

- Lucide 官方已移除品牌图标（Facebook / Twitter / Youtube / Instagram），用 `data-lucide="facebook"` 只会渲染空白，必须内联 SVG。
- `lucide.createIcons()` 在 `<script>` 中调用一次即可；若后续动态插入图标需再次调用。
- Tailwind v4 浏览器版对 `@apply` 支持有限，自定义样式直接写原生 CSS。
