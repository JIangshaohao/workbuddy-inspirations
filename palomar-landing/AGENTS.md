# AGENTS.md — Palomar Landing

## 项目简介
Palomar Labs 营销落地页的像素级复刻：固定导航栏 + 全视口视频 Hero，仅此两部分，另有 Hero 内的 "Trusted by" 标识行。

## 技术栈
- 语言/框架：**原生 HTML + CSS + JavaScript**（零框架、零构建、零依赖）
- 图标：内联 SVG（对应原规格的 lucide-react `ChevronDown` / `ArrowRight` / `Triangle` 图标形状）
- 外部资源：CloudFront 背景视频 + onlinewebfonts / Google Fonts
- 运行环境：任意静态服务器或直接双击 `index.html`

## 目录结构
```
palomar-landing/
├── index.html          # 页面结构（Nav / Hero / Trusted by）+ 字体 link + 标题
├── styles.css          # token（CSS 变量）、reset、keyframes、全部组件样式与响应式断点
├── main.js             # 导航滚动态、移动端菜单开关与滚动锁定、ESC 关闭、视频播放兜底
├── tools/verify.js     # CDP 验收脚本：多断点截图 + 几何/样式断言（需本机 Chrome）
└── shots/              # 验收截图产物（已 gitignore）
```

## 运行 / 构建方式
无构建。任选其一：
```bash
# Python 内置静态服务器
python -m http.server 5180 --bind 127.0.0.1

# 或 Node
npx serve .
```
浏览器访问输出的本地地址即可。

验收：
```bash
node tools/verify.js
# 产出 shots/desktop.png、tablet.png、mobile.png、mobile-menu.png 并打印几何/样式指标
```

## 编码约定
- 类名用语义化短横线（`.navbar__cta`、`.trusted__logo--playfair`），与原 Tailwind 类名保持可追溯的对应关系。
- 颜色与字体一律走 `styles.css` 顶部的 `:root` CSS 变量（`--brand-dark` / `--brand-green` / `--brand-light` / `--brand-cream`，`--font-*`），禁止在规则里硬编码色值。
- 动画统一使用 `.animate-fade-up` / `.animate-fade-down` + `.stagger-N`，不得改写 keyframes 的时长与缓动。
- 视频地址、字体链接为规格指定资源，不得替换。
- 脚本使用原生 DOM API + IIFE 封装，不引入任何库。

## 注意事项
- Hero 的视频必须保持 `object-fit: cover; object-position: center bottom`，否则底部取景会被裁掉。
- 移动端菜单打开时必须锁定 `document.body.style.overflow = 'hidden'`，关闭后恢复为空字符串。
- 页面只允许导航栏与 Hero 两部分，禁止新增 Footer、弹窗、二次标题、遮罩层、视频控制条等。
- 背景视频约 12MB，首次加载需十几秒；验收脚本必须轮询 `video.readyState >= 2` 再截图，不能用固定 sleep。
