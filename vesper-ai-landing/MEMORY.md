# MEMORY.md — vesper-ai-landing

## 长期上下文

按精确规格复刻的单视口落地页（2026-10-22 重建）。规格来源为用户提供的完整实现文档，页面行为、字号、动效参数均以该规格为准，勿凭审美自由发挥。

- 位置：`E:\VibeCoding\Workbuddy\vesper-ai-landing\`（2026-10-22 从 Everyday 工作区移入）。
- 背景视频地址为指定的 CloudFront MP4，勿替换。
- 标题必须纯色白，无渐变、无扫光。

## 架构决策

- 决策：多文件结构（`index.html` + `styles.css` + `main.js`），非单文件内联。
  - 原因：规格明确给出此文件结构；字体/图标走 CDN 已是外链，内联无收益。
  - 影响：本仓库「单文件双击即开」约定仅其余灵感适用，本灵感入口仍是 `index.html` 双击可开，但依赖网络。
- 决策：菜单显隐用 `hidden` 属性 + 互补 JS。
  - 原因：语义化；但媒体查询的 `display:flex` 会覆盖 `[hidden]`，必须配套 `[hidden]{display:none!important}`。
- 决策：数字滚动用 IntersectionObserver 只触发一次。
  - 原因：单视口页面统计区首帧即在视口内，重复触发无意义。

## 踩坑记录

- 现象：移动端首次截图时菜单默认展开 ｜ 根因：媒体查询 `.menu-sheet{display:flex}` 覆盖 HTML `hidden` 属性（UA 样式优先级不足）｜ 解决：补 `.menu-overlay[hidden],.menu-sheet[hidden]{display:none!important}`。
- 现象：副标题渲染成 3 行 ｜ 根因：`white-space:pre-line` 把源码折行变成强制换行 ｜ 解决：移除，交给自然换行（max-width 500px 下自然 2 行）。
- 现象：logo 在白底圆中缩成一个小点 ｜ 根因：Pillow 绘制时画布 `N=104*S` 与坐标缩放 `24*S` 不是同一系数，标记只占 24/104 ｜ 解决：统一 `k = N/24` 缩放系数超采样绘制。
- 现象：jsdelivr/unpkg 直连下载字体 SSL handshake EOF ｜ 根因：本机网络对这两个域的 TLS 干扰 ｜ 解决：改走 GitHub Contents API（vercel/geist-font 仓库 `fonts/GeistPixel/webfonts/GeistPixel-Circle.woff2`）。

## 外部资源

- BubbledotICG-FinePos：`https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos`（规格要求用 CDN，不要用本地 Bubbledot 文件）。
- 背景视频：`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4`。
- GeistPixel-Circle 来源：https://github.com/vercel/geist-font （`fonts/GeistPixel/webfonts/`）。

## 验证方式（本机无头 Chrome）

- 截图必须 `run_in_background` 运行（前台易被 SIGTERM）。
- 窄视口下 `--virtual-time-budget` 偶发挂起，改用 `--timeout=8000` 稳定。
- 多实例并发需各自 `--user-data-dir` 隔离。
- 横向溢出量测：注入探针脚本输出 `document.documentElement.scrollWidth` vs `innerWidth`，桌面 1280、移动 600 均无溢出。
