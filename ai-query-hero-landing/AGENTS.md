# AGENTS.md — AI Query Hero Landing

## 项目简介
单视口 AI 搜索落地页 Hero：全屏循环视频背景 + 毛玻璃搜索卡（额度栏 / 输入区 / 工具行）+ 居中大标题，复刻一份 Figma 级设计规格。

## 技术栈
- 语言/框架：原生 HTML5 + Tailwind CSS（Play CDN v3）+ 原生 JS（零构建、零 npm 包）
- 动效：自研 `requestAnimationFrame` 视频淡入淡出系统（**不使用 CSS transition**）
- 字体：Google Fonts —— Schibsted Grotesk / Inter / Noto Sans / Fustat，各 400/500/600/700
- 图标：内联 SVG（Lucide 风格路径，`currentColor` 描边）
- 媒体：CloudFront 外链 MP4（规格提供，不下载到本地）

## 目录结构
```
ai-query-hero-landing/
├── index.html      # 唯一入口，结构 / 样式 / 脚本全部内联
├── tools/
│   └── verify.js   # CDP 验收脚本：多断点截图 + 关键样式断言
├── AGENTS.md
├── README.md
└── MEMORY.md
```

## 运行 / 构建方式
```bash
cd ai-query-hero-landing
python -m http.server 5181
# 浏览器访问 http://127.0.0.1:5181
```
双击 `index.html` 也能打开，但跨域字体/视频在 `file://` 下可能受限，推荐用静态服务器。

## 编码约定
- 单文件优先：结构、样式、脚本全部内联在 `index.html`，不拆 CSS/JS 文件。
- 字号、字距、圆角一律走 Tailwind 任意值类（如 `text-[80px]`、`tracking-[-4.8px]`），与设计规格数值一一对应，不做二次"美化"。
- 颜色只用规格色板：黑 `#000000`、灰 `#505050`、浅灰 `#f8f8f8`、深徽章 `#0e1311`、白 `#ffffff`、绿色升级按钮 `rgba(90,225,76,0.89)`、暗色覆层 `rgba(0,0,0,0.24)`。
- 字体族统一走 `tailwind.config` 的 `fontFamily` 扩展（`schibsted` / `inter` / `noto` / `fustat`），不在行内写 `font-family`。
- 视频透明度**禁止**使用 CSS transition；淡入淡出一律走 rAF。

## 注意事项
- 背景视频必须 `muted` + `playsinline` + `autoplay` 才能自动播放（iOS 要求）。
- 视频**不要**加 `loop` 属性：规格要求在 `ended` 里手动 `currentTime = 0` 重播并二次淡入，加了 `loop` 会导致 `ended` 永不触发。
- 淡出触发依赖 `timeupdate` 事件，浏览器触发频率约 4 次/秒，阈值 0.55s 足够被捕获。
- `fadingOut` 标志位必须在下一轮循环开始时复位，否则第二圈不再淡出。
- 移动端导航链接隐藏（`hidden lg:flex`），仅保留 Logo 与两个 CTA。
