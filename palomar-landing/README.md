# Palomar Landing

> Palomar Labs 落地页的像素级复刻：固定导航栏 + 全视口视频 Hero。原生 HTML + CSS + JS，零依赖零构建。

## 这是什么
面向 Palomar Labs 的营销页首屏复刻版本。目标是视觉与交互与原站一致：顶部固定导航（滚动后变为奶油色毛玻璃），下方是铺满视口的风景视频，内容左对齐排布，包含一个公告胶囊、一个主标题，以及一行 "Backed by" 投资方字标。

只包含 Navbar 与 Hero 两个部分，没有其他 section。

原生三文件实现：`index.html` + `styles.css` + `main.js`，无需 npm install、无需打包，双击或起个静态服务器即可运行。

## 效果
- 桌面端（≥768px）：左侧 Solutions / Plans / News，中间居中三角 Logo + Palomar 字样，右侧 "Try It Free" 胶囊按钮，导航高 80px。
- 移动端（<768px）：汉堡按钮 + 全屏奶油色覆盖菜单（链接 30px 居中排列 + 胶囊 CTA），导航高 64px，打开时锁定页面滚动。
- 首屏背景为全屏视频，无遮罩、无渐变，底部始终保持取景（`object-position: center bottom`）。
- 响应式断点：sm 640 / md 768 / lg 1024，与规格一致。

## 使用方式
```bash
python -m http.server 5180 --bind 127.0.0.1
```
浏览器打开 http://127.0.0.1:5180/ 即可。

视觉验收（需本机 Chrome）：
```bash
node tools/verify.js
```

## 技术要点
- 颜色 token 集中在 `styles.css` 的 `:root`（`--brand-dark` / `--brand-green` / `--brand-light` / `--brand-cream`），字体 token 同处（`--font-helvetica-neue` 与 5 种展示字体）。
- 动画为纯 CSS keyframes：`fade-up`（向上淡入）与 `fade-down`（向下淡入），配合 `stagger-1` ~ `stagger-6` 实现 0–600ms 的入场节奏。
- 图标用内联 SVG，形状与原规格的 lucide 图标一致（Triangle 为实心）。
- 视频与字体均为外部 CDN 资源，无需本地打包；视频约 12MB，首次加载需十几秒属正常。
