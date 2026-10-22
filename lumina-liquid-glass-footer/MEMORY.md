# MEMORY.md — LUMINA 液态玻璃落地页

## 长期上下文

- 需求来源：一份 React + Tailwind v4 + `motion/react` + `lucide-react` 的落地页规格（沉浸式视频背景 + 液态玻璃页脚）。
- 用户在提出需求时明确表示**更偏向静态网页**，因此放弃 React/Vite 构建链，改为纯静态单文件实现，视觉与结构与原规格等价。
- 项目为独立灵感文件夹，不依赖仓库内其它灵感。

## 架构决策

- **决策**：用 `@tailwindcss/browser@4` 运行时编译 Tailwind，而非构建时编译。
  - 原因：静态交付诉求；无 `node_modules`、无构建产物，仓库保持干净。
  - 影响：首屏需下载 Tailwind 运行时，弱网下有轻微 FOUC 风险；换取零安装成本。
- **决策**：动画用 CSS keyframes 而非引入 GSAP / motion 库。
  - 原因：规格里唯一的动画是页脚入场与图标 hover，CSS 足够；少一个依赖少一份维护成本。
  - 影响：后续若要加滚动编排动画，需要引入 `motion` 或 GSAP。
- **决策**：玻璃描边用 `::before` + `mask-composite: exclude`，不用 `border-image` 或 `border`。
  - 原因：规格要求的是**上下边缘高光、中部透明**的非均匀描边，`border` 无法表达。
  - 影响：必须保留 `padding: 1.4px`，改 padding 会改变描边粗细。
- **决策**：社媒图标用内联 SVG 而非 Lucide。
  - 原因：Lucide 已移除所有品牌图标（facebook/twitter/youtube/instagram 均无）。
  - 影响：`data-lucide="facebook"` 这类写法在当前 Lucide 版本静默渲染空白。

## 踩坑记录

- **现象**：想用 `data-lucide="facebook"` 等品牌图标，结果页脚图标位置一片空白。
  - 根因：Lucide 官方仓库已移除品牌类图标集（版权原因），UMD 包中不存在这些节点名，`createIcons()` 找不到对应图标便不渲染。
  - 解决：音乐图标继续用 Lucide（`music-2` 有效），四个社媒图标改内联 SVG path。
- **现象**：Tailwind v4 浏览器版中 `@apply` 在 `<style type="text/tailwindcss">` 内受限。
  - 根因：浏览器版只实现了 `@theme` / `@utility` 等新式指令的运行时子集。
  - 解决：自定义样式直接写原生 CSS（`.liquid-glass`、动画 keyframes），原子类照常写在 HTML 里。

## 用户纠正 / 偏好

- 用户偏好静态网页而非带构建链的框架项目。
- 用户偏好新建独立文件夹制作，不影响现有项目（已严格遵守：只新建 `lumina-liquid-glass-footer/`，未改动其它文件夹）。

## 外部资源

- 背景视频：https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4
- 字体：Helvetica Regular（https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.*）
- Tailwind v4 CDN：https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4
- Lucide UMD：https://unpkg.com/lucide@latest/dist/umd/lucide.js
