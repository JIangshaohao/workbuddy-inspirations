# MEMORY.md — 灵感工作区

本文件记录**仓库级**的长期上下文。单个灵感的细节请见各自文件夹下的 `MEMORY.md`。

---

## 仓库定位

`E:\VibeCoding\Workbuddy` 是一个灵感工作区，用于承载多个互不相关的灵感/小项目，整体上传到 GitHub 进行版本管理与备份。

---

## 核心约定（最重要）

**一灵感 = 一文件夹**，每个灵感文件夹内必须包含三个文件：

- `AGENTS.md` —— 灵感级规则
- `README.md` —— 灵感级说明
- `MEMORY.md` —— 灵感级长期上下文

创建新灵感时，先建文件夹、先写三件套，再开始写代码。
详细规则与模板见根目录 [`AGENTS.md`](./AGENTS.md)。

---

## 灵感索引

| 文件夹 | 灵感名称 | 技术栈 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| `css-loading-animations` | CSS 加载动画合集（8 种纯 CSS Loading） | HTML + 纯 CSS | 已有内容 | 单文件 `index.html`，已回填三件套 |
| `city-itinerary-planner` | 城市行程规划单文件 HTML（Stripe 风格时间轴 + 腾讯地图） | HTML + 原生 JS + 腾讯地图 JSAPI GL | 已有内容 | 样例为成都 3 日行程；配套技能在 `.workbuddy/skills/city-itinerary-planner/` |
| `resume-landing-page` | 网页简历 Landing Page（Aurora 深色极光主题，金字塔叙事骨架） | HTML + 内联 CSS + 原生 JS（零依赖零外链） | 已完成 | 产物 `data.json` + `output.html`；服务对象为 Harrison Jiang（Java 后端） |
| `colorharbor-palette` | ColorHarbor 配色收藏库（暗色画廊，30 组配色 + 详情 UI 预览） | HTML + 纯 CSS + 原生 JS（零依赖单文件） | 已完成 | 单文件 `index.html`；含 masonry 画廊、分类过滤、随机发现、收藏抽屉、详情态 UI 预览、一键复制色值 |
| `hangzhou-3day-nature-map-guide` | 杭州三日自然山水游 · 地图行程指南（全屏腾讯地图 + 行程面板联动） | HTML + 原生 JS + 腾讯地图 JSAPI GL | 已完成 | 单文件 `index.html`；走 `_TMapSecurityConfig` 代理鉴权，前端零明文 Key |
| `netmusic-listening-portrait` | 网易云音乐「你的听歌画像」单文件数据报告 | HTML + 内联 SVG + Node 构建期预渲染 | 已完成 | 单文件 `index.html`（约 197KB，图片全内联）；数据来自本地 `NeteaseCloudMusicApi` 扫码登录；构建脚本在 `.workbuddy/tmp/netease-api/` |
| `ganfan-blindbox-workbench` | 吃了吗您 · 干饭盲盒工作台（抽卡决定吃啥 + 饭票透支） | 单文件 HTML + 资料库运行时 SDK（零依赖零外链） | 已完成 | **一键做同款**复制产物；产物 `output.html`；托管于资料库页面 `fuLFSrmasJFqEEiSjogVYZ`，绑定数据表「菜品池」`komd1ZY7LY1QI8JfhST0zr`（29 行）与「吃饭记录」`IkagYbTEezIbu7PgapjVnX`（空表） |
| `old-photo-restoration` | 老照片修复工作台（浏览器端四步修复管线 + 逐阶段量化指标） | 单文件 HTML + 原生 JS（零依赖零外链，算法自实现）；附 Python CLI 参考实现 | 已完成 | 主产物 `index.html`；CLI `scripts/beautify.py`；CDP 验收脚本 `tools/verify_page.js`（9 项指标口径，含 2 个历史回归项） |
| `vesper-ai-landing` | 单视口视频背景落地页（点阵标题 Hero + 四项统计滚动） | 原生 HTML/CSS/JS 多文件（规格要求，例外于单文件约定）；CloudFront 背景视频 + CDN 字体 | 已完成 | 入口 `index.html`；`styles.css` + `main.js` + `assets/logo.webp` + `fonts/GeistPixel-Circle.woff2`；2026-10-22 从 Everyday 移入 |
| `velorah-hero-landing` | Velorah® 单屏电影感 Hero（全屏视频背景 + 液态玻璃导航 + 衬线大标题） | 单文件 HTML + Tailwind CDN + Google Fonts | 已完成 | 入口 `index.html`；用户要求纯静态，放弃 React + Vite + shadcn/ui 方案；CloudFront 视频外链 |
| `lumina-liquid-glass-footer` | LUMINA 液态玻璃落地页（全屏视频背景 + 渐变描边玻璃页脚） | 单文件 HTML + Tailwind v4 CDN + Lucide CDN | 已完成 | 原规格为 React + `motion/react`，用户偏好静态网页，故改为纯静态等价实现；社媒图标用内联 SVG（Lucide 已移除品牌图标） |
| `palomar-landing` | Palomar Labs 落地页像素级复刻（固定导航 + 全视口视频 Hero） | 原生 HTML + CSS + JS（零框架零依赖零构建） | 已完成 | 三文件 `index.html`/`styles.css`/`main.js`；内联 SVG 图标；CDP 验收脚本 `tools/verify.js`（多断点截图 + 样式断言）；规格禁止 Footer/额外 section |
| `asme-liquid-glass-landing` | Asme 液态玻璃品牌落地页（全屏视频 Hero + 5 区块 + 滚动渐入） | 单文件 HTML + Tailwind CDN + 原生 JS（零构建零依赖） | 已完成 | 入口 `index.html`；规格为 React+Vite+framer-motion，用户偏好静态改为纯静态等价实现；CloudFront 视频 + Google Fonts + 内联 SVG 图标 |

> 每新增一个灵感，必须在本表追加一行。

---

## 项目级技能

本仓库内的可复用技能统一放在 `.workbuddy/skills/<skill-name>/`（WorkBuddy 的项目级技能发现路径，随仓库一起上传）。

| 技能 | 用途 | 来源灵感 |
| --- | --- | --- |
| `city-itinerary-planner` | 生成城市多日行程规划单文件 HTML（Stripe 风格 + 腾讯地图打点连线） | `city-itinerary-planner` |

---

## 架构决策

- **决策**：采用「一灵感一文件夹 + 三件套」的扁平结构，而非 monorepo 工作区工具。
  - 原因：灵感之间无共享依赖，扁平结构最简单、GitHub 上最直观，无需引入 pnpm/npm workspaces 等额外复杂度。
  - 影响：无跨灵感复用；若未来出现共享代码，需另建 `shared/` 或抽成独立库。
- **决策**：不引入任何构建工具链作为默认。
  - 原因：多数灵感是单文件即可运行的 HTML/JS 演示，构建链带来的维护成本大于收益。
  - 影响：当某个灵感确实需要构建时，在其自身文件夹内独立引入，不污染仓库根。

---

## 踩坑记录

- **GitHub MCP 集成没有建仓权限**：调用 `create_repository` 返回 `403 Resource not accessible by integration`（该 App 未获得 repo 创建授权）。可用本机 `~/.git-credentials` 中已存 PAT（scopes: `gist, repo, workflow`）直接调 REST API 建仓：`POST https://api.github.com/user/repos`；推送仍走 `git push` + `credential.helper=store`。
- **`core.autocrlf=true` 会在每次 add 时刷一屏 LF→CRLF 警告**：仓库根已加 `.gitattributes`（`* text=auto eol=lf`），并在本仓库设 `core.autocrlf=false`，索引与工作区统一 LF。
- **文件大小写**：Windows 本地不区分大小写，但 GitHub 服务端区分。三件套统一使用全大写 `AGENTS.md` / `README.md` / `MEMORY.md`，避免出现本地正常、远端重复文件的诡异问题。
- **SVG 表现属性不支持 CSS 变量**：`setAttribute("stroke", "var(--x)")` 与 `<stop stop-color="var(--x)">` 均**静默失效**（回退为默认色），因为表现属性在解析期不接受 `var()`。必须改用 `el.style.stroke = "var(--x)"` 或 `style="stop-color:var(--x)"`。用 `document.createElementNS` 手工构建渐变是更稳的做法。
- **`.reveal.in { transform: none }` 会静默压制 hover 抬升**：两者特异性相同（0,2,0），后写的 `.reveal.in` 胜出。若卡片类元素同时挂了渐入类与 hover 变换，必须在动画结束后**摘掉渐入类**，把 transform 交还给组件自身规则。
- **CSS Grid 的 `span` 组合要算总格数**：6 列网格里 `3+3+2+2+2+3` = 15 格，不是 3 行的整数倍（18），自动布局必然留下参差空档。排 span 前先让 `Σ(列span × 行span)` 等于 `列数 × 行数`。
- **`file://` 下浏览器会以 CORS 拦截本地 JSON 读取**：单文件 HTML 不能 `fetch('data.json')`，只能内嵌数据常量。代价是数据双份维护。
- **`history.replaceState` 在 `file://` 下可能抛 SecurityError**：调用处必须 try/catch。
- **腾讯地图路线 `polyline` 是压缩增量格式，不是坐标对**：形如 `lat0,lng0,dLng1,dLat1,dLng2,dLat2,...`——首点为绝对经纬度（纬度在前），其后每两个值是相对前一点的 (Δlng, Δlat)，单位 1e-6 度，必须逐项累加还原；直接当 `lat,lng` 交替解析会得到完全错误的轨迹。
- **腾讯地图 JSAPI 的 `color` 类字段只认 `rgb()/rgba()/#RRGGBB`**：传 `hsl()` 不报错但渲染成白色。折线样式另有硬约束——`width` 必须正整数、`borderWidth` 必须非负整数，传小数该属性静默失效。
- **验证超长单页 HTML 不能靠 `chrome --screenshot`**：该命令只截视口，且 `100svh` 类单位会把 Hero 撑满整个超长窗口，正文根本截不到。正确做法是用 CDP：`Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot({captureBeyondViewport:true, clip:{...}})`。Node 22 自带 `WebSocket`，无需额外依赖。查横向溢出同样用 CDP 跑 `Runtime.evaluate` 测量，比肉眼看截图可靠。
- **网易云音乐接口的 `user_playlist` 里 `specialType: 0` 混装自建与订阅歌单**：必须用 `subscribed` 字段区分，否则「自建歌单数」会算错（详见 `netmusic-listening-portrait/MEMORY.md`）。
- **图像处理里「平面 vs 交错」通道布局错位是静默事故**：用 `out.set(channel, c*N)` 写平面布局、却按 `rgb[i*3+c]` 交错读取，不抛异常、不报错，只表现为色彩整体崩坏。**识别手法**：算「通道间均值差」（如 R−B），若从一个明显非零值精确变成 0，就是布局被错位解释的铁证。
- **模板字符串里未转义的反引号会截断模板**，导致整个 `<script>` 块语法错误、页面所有交互失效，而浏览器只报一个含糊的 "x is not a function"。**排查手法**：用脚本抽取 `<script>` 内容到 `.js`，跑 `node --check`，秒级定位到行。
- **滤波器的 `eps`/阈值必须实测定标，不能套教科书公式**：凭"0.11×255 的平方"拍出的 eps 会使自适应系数中位数只有 0.29，把纹理抹平。正确做法是做参数扫描，按目标权衡曲线（如"降噪强度 vs 纹理保留"）选点。
- **不要用整图 Laplacian 方差论证"变清晰了"**：噪点/颗粒本身就是高频，颗粒多的一方永远赢。该指标只能在相邻处理阶段之间比较；跨"处理前/后"比较需要换成只统计纹理区能量的口径。
- **`chrome --screenshot` 验证不了带运行时逻辑的单页**：该命令只截视口且不执行脚本。正确做法是 CDP：`Emulation.setDeviceMetricsOverride` + `DOM.setFileInputFiles` + `Runtime.evaluate({awaitPromise:true})`。Node 22 自带 `WebSocket`，无需额外依赖（已验证脚本见 `old-photo-restoration/tools/verify_page.js`）。
- **`git push` 直连 github.com:443 会卡 21 秒后超时**：本机需走 Clash 混合端口 `127.0.0.1:7897`。不要改全局 `git config`，用一次性参数即可：`git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin main`。探测可用端口：`Test-NetConnection 127.0.0.1 -Port <port> -InformationLevel Quiet`。
- **截图验证大体积背景视频必须轮询 `video.readyState`，不能用固定 sleep**：12MB 视频在 headless Chrome 中从 `readyState 0` 到 `4` 需约 20 秒，固定 sleep 3~5s 只会拍到空白底色，极易误判为"视频不显示 / 编码不支持"。正确做法是轮询到 `readyState >= 2`（已解首帧）再 `Page.captureScreenshot`。
- **Windows 上删 `node_modules` 可能报"拒绝访问"**：残留的 dev server 会锁住 `esbuild.exe` / `*.node` 原生模块句柄。先停掉占用进程，再 `cmd /c rmdir /s /q node_modules`。

---

## 用户偏好

- 结论先行，再解释原因；直接、基于事实，不要谄媚式开场。
- 解释"为什么"和"影响"，而不只是"怎么做"。
- 下一步明确时不要问"是否需要继续"，直接做。
- 重复三次以上的事情，考虑用 AI 或自动化解决。
- 代码/变量名/文件名用英文；注释、commit message、文档用中文。

---

## 外部资源

- GitHub 远端仓库：https://github.com/JIangshaohao/workbuddy-inspirations （Public，主分支 `main`）
- 仓库根 `README.md` 是面向访客的项目索引页；新增灵感时必须同步更新其中的「项目索引」表。
