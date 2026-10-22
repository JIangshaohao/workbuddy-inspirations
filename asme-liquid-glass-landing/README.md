# Asme — Liquid Glass Landing

> 一个液态玻璃风格的品牌落地页，单文件静态实现，零构建零依赖。

## 这是什么

复刻一份 RECREATION 规格的 React + Vite + Tailwind + framer-motion 落地页，但以**纯静态单文件 HTML** 实现：双击即可打开，无需 `npm install`、无需构建、无本地依赖。

规格中的全部视觉均保留：

- 全屏视频 Hero，无缝循环 + 交叉淡入淡出
- 液态玻璃导航胶囊、按钮、卡片、社交图标
- Instrument Serif 衬线大标题 + 斜体点缀
- 5 个区块：Hero / About / Featured Video / Philosophy / Services
- 滚动渐入动效 + 卡片 hover 缩放

## 使用方式

1. 下载或克隆本仓库。
2. 双击 `index.html` 在浏览器打开（需联网加载视频、字体与 Tailwind CDN）。
3. 或 `python -m http.server 8000` 后访问 `http://localhost:8000`。

## 技术要点

- **`.liquid-glass`**：`backdrop-filter: blur` + `mask-composite` 渐变描边（`::before` 内衬 1.4px 渐变环）。
- **Hero 无缝循环**：`requestAnimationFrame` 驱动 opacity 淡入淡出，`timeupdate` 判剩余 ≤0.55s 提前淡出。
- **滚动渐入**：`IntersectionObserver` + CSS 变量驱动 `transform`/`opacity`，等价 framer-motion `useInView`。
- **图标**：内联 SVG（Lucide 路径），无图标库外链。
