# CSS 加载动画合集

> 8 种纯 CSS 加载动画，零依赖，复制即用。

## 这是什么

一个单文件的 Loading 动画参考页。用于在开发中快速找到、预览、并复制一段可直接粘贴进项目的加载动画样式。

目标场景：前端开发时需要「一个好看的 loading」，但不想引入任何 UI 库或动画库。

## 包含的 8 种动画

| # | 名称 | `data-anim` | 关键实现 |
| --- | --- | --- | --- |
| 1 | 旋转圆环 | `ring` | `border-top-color` + `rotate` |
| 2 | 脉冲圆点 | `dots` | 多圆点错峰 `scale`/`opacity` |
| 3 | 弹跳柱条 | `bars` | 柱条 `translateY` + `animation-delay` |
| 4 | 波纹圆圈 | `ripple` | 双圈 `scale` + 渐隐 |
| 5 | 渐变锥形旋转器 | `conic` | `conic-gradient` + `mask` |
| 6 | 打字指示器 | `typing` | 三点上下跳动 |
| 7 | 骨架屏微光 | `skeleton` | `linear-gradient` 位移扫光 |
| 8 | DNA 双螺旋 | `dna` | 两组圆点反向 sin 位移 |

## 使用方式

1. 直接用浏览器打开 `index.html`。
2. 找到想要的动画卡片，点击 **复制 CSS**。
3. 粘贴进你的样式文件，按需改 `--c` 系列变量即可换色。

## 技术要点

- **主题化**：全部颜色与尺寸通过 CSS 自定义属性驱动，卡片内联注入 `--c` / `--c2` / `--glow` / `--accent`，样式表中不出现硬编码色值。
- **可复用性**：「复制 CSS」抽取的是该卡片对应的 `ld-*` 类与其 `@keyframes`，粘贴后即可独立工作。
- **兼容性**：复制功能优先使用 `navigator.clipboard`，在 `file://` 等非安全上下文下降级为 `textarea + execCommand`，保证本地双击打开也能用。

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面全部内容（样式 + 结构 + 脚本） |
| `AGENTS.md` | 项目规则与编码约定 |
| `MEMORY.md` | 架构决策与踩坑记录 |
