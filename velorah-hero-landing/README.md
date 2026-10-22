# Velorah Hero Landing

> Where dreams rise through the silence. — 单页电影感 Hero 落地页

## 这是什么
为虚构创意工作室 **Velorah®** 制作的单页首屏（hero-only landing page）。面向需要一个「安静但有分量」的首屏视觉的品牌 / 产品团队。

解决的核心问题：**如何在不堆叠装饰元素的前提下，用一段全屏视频 + 排版节奏撑起一个有质感的首屏**。因此页面完全不加光斑、渐变遮罩或额外图形——深度全部由视频本身提供。

## 效果 / 截图
- 全屏 `object-cover` 循环视频铺底
- 顶部液态玻璃（liquid glass）导航，Logo 使用 Instrumental Serif
- 主标题 8xl 衬线排版，`dreams` 与 `through the silence.` 用次要灰色做断句
- 按钮采用液态玻璃描边 + `hover:scale-[1.03]`

## 使用方式
1. 用任意静态服务器打开 `index.html`：

```bash
cd velorah-hero-landing
python -m http.server 8080
```

2. 或直接双击 `index.html`（外链视频与字体需联网）。

## 技术要点
- **字体**：`Instrumental Serif`（标题）+ `Inter` 400/500（正文），通过 CSS 变量 `--font-display` / `--font-body` 统一管理。
- **主题**：Tailwind `tailwind.config` 中以 HSL 定义 `background / foreground / muted-foreground / primary / secondary / accent / border / input`，全站不写死颜色。
- **液态玻璃**：`.liquid-glass` 使用 `backdrop-filter: blur(4px)` + 内阴影，配合 `::before` 的 `mask-composite: exclude` 抠出 1.4px 渐变高光描边。
- **入场动画**：`fade-rise` 关键帧（opacity + translateY），三个延迟档位 `0s / 0.2s / 0.4s` 分别用于 H1、副文案、CTA。
- **性能**：仅动画 transform 与 opacity；`prefers-reduced-motion` 时全部关闭。
