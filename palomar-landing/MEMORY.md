# MEMORY.md — Palomar Landing

## 长期上下文
- 本项目是按用户给定规格书实现的**精确复刻**，不是自由发挥的设计稿。任何改动都应先确认是否仍与规格一致。
- 规格约束：只允许 Navbar + Hero（含 TrustedBy）；禁止 Footer、额外 section、搜索、语言切换、社交图标、视频控制条、遮罩层、第二个标题、Hero 主 CTA、Solutions 下拉面板、其他视频源。
- 视频地址与字体链接被规格明确指定，不得替换或改写。

## 架构决策
- 决策：**改用原生 HTML + CSS + JS，移除 React / TypeScript / Vite / Tailwind** ｜ 原因：用户明确要求以 js+css+html 方式实现 ｜ 影响：零依赖零构建，`index.html` 可直接双击打开；同时保留 `tools/verify.js` 做像素级验收，不依赖人工肉眼比对。
- 决策：**规格本身并未规定框架** ｜ 原因：原始规格文本只给出 Tailwind 风格的类名、颜色 token 与字体 token，框架属实现自由度 ｜ 影响：初版选 React 是实现选择而非规格要求；后续改为原生不违反规格。
- 决策：Tailwind 类名逐条翻译为手写 CSS，类名改用语义化短横线命名 ｜ 原因：保留可追溯对应关系的同时摆脱构建链 ｜ 影响：`.navbar__cta` 等类替代 `.ml-auto px-5 py-2.5 bg-brand-dark`；尺寸断点与缓动值与规格一一对应。
- 决策：图标用内联 SVG 而非图标库 ｜ 原因：零依赖约束，且只有 3 个图标 ｜ 影响：形状手工对齐 lucide 的 `ChevronDown` / `ArrowRight` / `Triangle`；Triangle 需显式 `fill` + `stroke` 才是实心效果。
- 决策：颜色与字体统一收敛到 `:root` CSS 变量 ｜ 原因：等价于 Tailwind 的 theme token ｜ 影响：改品牌色只需改 4 个变量。
- 决策：动画只用 CSS keyframes，不引入 JS 动画库 ｜ 原因：规格已给出精确的 keyframes 与 stagger 延迟 ｜ 影响：入场动效完全由 class 驱动。

## 踩坑记录
- **视频截图抓早会导致"视频不显示"的误判**：背景视频约 12MB，headless Chrome 中 `readyState` 从 0 到 4 需约 20 秒。固定 sleep 3~5s 截图只会拍到空白 cream 背景。正确做法是轮询 `video.readyState >= 2`（已解出首帧）再截图，`tools/verify.js` 中封装为 `waitVideo()`。
- **headless Chrome 视频解码本身没问题**：`readyState: 4 / videoWidth: 1920 / videoHeight: 1080` 证明 H.264 视频正常解码，不要误判为编码不支持。
- **汉堡菜单两条横杆展开时中点相差 2px**：规格中上杆为 `top-[6px] + translate-y-[5px] = 11px`，下杆为 `top-[13px]`，两者不等。已按规格原样保留（像素级复刻优先）；如需严格 X 形，把下杆改为 `top-[11px]`。
- **JSX 折叠空格的问题在原生 HTML 中不存在**：`<br class="br-sm" /> test, ...` 在 HTML 中天然保留空格，无需 `{' '}`。
- **删除 node_modules 时 Windows 会因文件句柄占用失败**：预览服务（vite preview）会锁住 `esbuild.exe` / `rollup.win32-x64-msvc.node`。先停掉占用进程，再用 `cmd /c rmdir /s /q node_modules` 删除，否则报"拒绝访问"。

## 用户纠正 / 偏好
- 用户纠正：希望以 **js + css + html** 方式实现，不要 React/TS/Vite/Tailwind 那一套（2026-10-22）。
- 用户要求：新建独立文件夹，不影响工作区已有灵感项目（已建 `palomar-landing/`）。
- 用户提问时的关注点："这段提示词是否本身就是按 React 架构写的"——答案是规格未限定框架，React 只是初版实现选择。

## 外部资源
- 背景视频（12,067,334 bytes，H.264 / avc1，1920×1080）：`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260820_010308_b1636845-4c15-4ab6-b0c9-9a29bfb0c6e3.mp4`
- Helvetica Neue Light：`https://db.onlinewebfonts.com/c/0e6de1ec911a2e267ff136bbdd384a44?family=Helvetica+Neue+Light`
- Google Fonts：Playfair Display 700 / Oswald 500 / Montserrat 700 / Roboto Slab 600 / Raleway 700
- 验收脚本依赖本机 Chrome：`C:\Program Files\Google\Chrome\Application\chrome.exe`，走 CDP（Node 22 自带 WebSocket，无需额外依赖）
