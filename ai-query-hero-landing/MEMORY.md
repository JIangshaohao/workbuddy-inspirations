# MEMORY.md — AI Query Hero Landing

## 长期上下文

- 本项目为**纯静态单文件**页面（`index.html`），无构建、无 npm 包。
- 页面只有 Hero 一视口：视频背景 + 导航 + 标题组 + 搜索卡，无后续内容区块。
- 背景视频为外链 CloudFront MP4（1928×1072 / 24fps / 11.04s / 15.9MB），未下载到本地，保持仓库体积小；代价是断网/离线时首屏只有纯色背景。
- 视频内容是绿色山谷航拍：**顶部约 1/3 是亮白天空，中下部是深绿山丘**。因此黑色大标题落在上半部分才够对比度；副标题 `#505050` 属于中灰，压在绿丘上会发闷——这是视频内容带来的固有限制，不是实现缺陷。

## 架构决策

- 决策：采用 Tailwind Play CDN + 任意值类（`text-[80px]`、`tracking-[-4.8px]`）表达规格数值，而不是写自定义 CSS。
  原因：规格本身就是 Tailwind 风格的类名（`-mt-[50px]`、`rounded-[18px]`），用任意值类能让源码与设计稿逐项对得上，评审时一眼可核。
  影响：数值不再走设计 token 体系，后续改主题色需逐处替换。
- 决策：视频尺寸写 `.hero-video.hero-video`（双类名提高特异性）。
  原因：Tailwind preflight 内置 `img, video { max-width: 100%; height: auto }`，单类名选择器会被它压过，导致 `width: 115%` 实际只渲染成 100%（实测 1440px 而非 1656px）。
  影响：后续若换其他 CSS 框架，这处双类名需要重新验证。
- 决策：淡入淡出自研 rAF，不使用 CSS transition。
  原因：规格明确要求，且需要在"距结尾 0.55s 触发淡出"这种**基于播放时间轴**的条件下精确接管，CSS 动画做不到。
  影响：需自行处理动画帧取消（`cancelAnimationFrame`），否则新旧动画会同时写 `opacity` 互相覆盖。
- 决策：验收脚本用 CDP 而非 `chrome --screenshot`。
  原因：`chrome --screenshot` 只截视口且不执行脚本，测不了淡入淡出这类运行时逻辑。
  影响：需轮询 `video.readyState >= 2`，15MB 外链视频在 headless 中约需 20 秒才解首帧。

## 踩坑记录

- 现象：CDP 脚本里 `Runtime.evaluate` 返回 `undefined`，`waitVideo` 拿到 `null`。
  根因：`Page.navigate` 后立即求值，执行上下文已被销毁。
  解决：先轮询 `document.readyState === 'complete'`，再轮询视频 `readyState`；并把求值统一封装成 `evaluate()`，显式抛出 `exceptionDetails`，避免静默失败。
- 现象：`document.querySelector('header a.w-[82px]')` 抛 `is not a valid selector`。
  根因：CSS 任意值类名里的 `[`/`]`/`#` 在选择器中必须转义，手写转义极易出错（`#` 转义漏了就会整体失效）。
  解决：给需要断言的元素加**语义化 id**（`#nav-signup`、`#hero-badge`、`#credit-row` 等），验收脚本一律用 id 选择器，不再拼转义类名。
- 现象：探针把 `currentTime` seek 到距结尾 0.4s 后，`timeupdate` 事件数为 0、视频时间停滞不前进。
  根因：headless Chrome 中 seek 到接近结尾会等待该位置的数据缓冲，15MB 外链视频卡在缓冲态，事件根本不触发。**这是环境限制，不是实现缺陷**——真实浏览器里视频是连续播放的。
  解决：改用**确定性测试**——在页面内用 `Object.defineProperty` 在实例上覆盖 `duration` / `currentTime`（可遮蔽原型只读 getter）并手动派发 `timeupdate` / `ended`，直接对逻辑规则做断言。6 项断言全部通过。
- 现象：规格要求「`ended` 时 opacity 归零」，但若不取消正在跑的淡出帧，淡出动画会继续写 `opacity`，把归零效果覆盖掉。
  解决：`ended` 分支先 `cancelFade()` 再写 `opacity = '0'`。这条对应规格里「Each new fade cancels running animation frames to prevent competing animations」。
- 现象：移动端 390px 宽下页面被 120px 固定横向内边距挤到只剩 150px 内容宽，标题换行溢出、搜索卡工具行折行。
  解决：横向内边距改为 `px-6 sm:px-10 lg:px-[120px]`（桌面端仍是规格要求的 120px），标题字号在 `lg` 以下用 `text-[40px]/text-[56px]`，工具行与额度行允许换行。

## 用户纠正 / 偏好

- 用户明确要求「新建一个文件夹制作，不要影响其他文件夹中的内容」→ 本灵感完全独立于 `ai-query-hero-landing/`，未改动任何已有灵感目录。

## 外部资源

- 背景视频：`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4`
- 字体：Google Fonts（Fustat / Schibsted Grotesk / Inter / Noto Sans，各 400-700）
- 样式：Tailwind Play CDN v3
