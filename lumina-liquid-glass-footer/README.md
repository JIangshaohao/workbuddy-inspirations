# LUMINA — Liquid Glass Landing

> Premium clarity on global events and cosmic wonders, shared with all for free.

## 这是什么

一个**单视口沉浸式落地页**的静态实现：全屏循环视频作为背景，内容层浮于其上，页面底部是一块高反光的**液态玻璃（liquid glass）页脚**，包含品牌区、三列链接导航和社媒底栏。

面向：想快速验证「视频背景 + 玻璃拟态页脚」这套视觉语言的开发者/设计参考。

## 效果

- 背景：CloudFront MP4，`fixed` 全屏、`object-cover`、自动播放循环、静音。
- 遮罩：上深下深的三段渐变，保证前景文字对比度。
- 页脚：`liquid-glass` 类实现了**渐变描边**（非 `border`）——上边缘与下边缘高光、中部透明，`backdrop-filter: blur(4px)` + 内阴影营造玻璃厚度。
- 入场：页脚 `opacity 0→1` + `translateY(40px)→0`，1 秒、`delay .4s`、`easeOut`，与原 React 规格的 `motion.footer` 参数完全一致。
- 链接：hover 由 `text-white/70` 过渡到 `text-white`；社媒图标 `opacity .7→1`。

## 使用方式

1. 直接打开 `index.html`（需联网加载 CDN 资源）。
2. 或起一个静态服务器：
   ```bash
   cd lumina-liquid-glass-footer
   python -m http.server 8080
   # 浏览器访问 http://localhost:8080
   ```

## 技术要点

| 需求 | 实现 |
| --- | --- |
| 液态玻璃描边 | `::before` 伪元素 + `padding: 1.4px` + `mask-composite: exclude`，仅保留 1.4px 渐变环 |
| 背景视频 | `<video muted autoplay loop playsinline>`，置于 `z-[0]` 固定层 |
| Tailwind v4 无构建 | `@tailwindcss/browser@4` 运行时编译 + `<style type="text/tailwindcss">` 写 `@theme` |
| 根字体 | `@theme { --font-sans: "Helvetica Regular", ... }` |
| 图标 | Lucide UMD CDN；品牌图标内联 SVG（Lucide 无品牌图标） |
| 动效降级 | `prefers-reduced-motion` 下强制 `opacity:1 / transform:none` |

## 与原 React 规格的差异

原规格是 React + Tailwind v4 + `motion/react` + `lucide-react`。本页为**静态等价实现**：

- `motion.footer` → CSS keyframes，参数一致（1s / delay .4s / easeOut）。
- `lucide-react` → Lucide UMD；四个品牌图标换内联 SVG。
- Tailwind 原子类名、DOM 结构、层级与文案全部保留。
