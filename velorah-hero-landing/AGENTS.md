# AGENTS.md — Velorah Hero Landing

## 项目简介
单页电影感 Hero：全屏循环背景视频 + 液态玻璃导航 + 衬线大标题的极简落地页。

## 技术栈
- 语言/框架：原生 HTML5 + CSS（Tailwind CSS v3 via CDN）
- 运行环境：任意静态文件服务器（`python -m http.server`）或直接浏览器打开
- 依赖：无构建、无 npm 包；外部仅 Google Fonts 与 Tailwind CDN

## 目录结构
```
velorah-hero-landing/
├── index.html   # 唯一页面，含内联 Tailwind config 与全部样式
├── AGENTS.md
├── README.md
└── MEMORY.md
```

## 运行 / 构建方式
```bash
cd velorah-hero-landing
python -m http.server 8080
# 浏览器访问 http://127.0.0.1:8080
```

## 编码约定
- 单文件优先：结构、样式、脚本全部内联在 `index.html`，不拆分额外 CSS/JS 文件。
- Tailwind 颜色统一走 `tailwind.config` 中的 HSL 主题变量，页面内不写裸色值（除液态玻璃的 rgba 覆层）。
- 主题色仅一套深海军蓝：`hsl(201 100% 13%)` 背景 + 白前景 + 灰次要文字。
- 动画只用 `transform` / `opacity`（GPU 属性），通过 `.animate-fade-rise*` 三个类实现层级延迟。

## 注意事项
- 背景视频为外链 CloudFront MP4，必须 `muted` + `playsinline` 才能自动播放（iOS 要求）。
- `.liquid-glass::before` 使用 `mask-composite: exclude` 实现 1.4px 渐变描边，Safari 需 `-webkit-mask-composite: xor`，两者必须同时保留。
- 移动端导航链接隐藏（`hidden md:flex`），仅保留 Logo 与 CTA。
- 尊重 `prefers-reduced-motion`：命中时禁用入场动画。
