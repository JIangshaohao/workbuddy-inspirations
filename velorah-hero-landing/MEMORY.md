# MEMORY.md — Velorah Hero Landing

## 长期上下文
- 本项目为**纯静态单页**（用户明确偏好静态网页，放弃 React + Vite + TS + shadcn/ui 方案）。
- 页面只有 Hero 一屏：视频背景 + 导航 + 标题 + 双 CTA，无后续内容区块。
- 背景视频为外链 CloudFront MP4，未下载到本地（保持仓库体积小，代价是断网/离线时无背景）。

## 架构决策
- 决策：放弃 React + Vite + Tailwind CLI + shadcn/ui，改为单文件 HTML + Tailwind CDN。
  原因：交付物只是一个首屏，引入构建链路与组件库属于过度工程；静态页可直接打开、可部署到任意静态托管。
  影响：无法做组件复用与主题切换，但当前需求范围内无收益。
- 决策：样式收敛在 `index.html` 内联，不拆 `css/` 与 `js/` 目录。
  原因：单页内容量小，拆分反而增加跳转成本。
- 决策：颜色全部定义为 HSL 变量并挂到 Tailwind config，而不是直接写 hex。
  原因：便于后续整体换肤，且与原设计规范中的 HSL 变量约定一致。

## 踩坑记录
- 现象：液态玻璃描边在 Safari 上不显示。
  根因：`mask-composite: exclude` 是标准写法，Safari 需要 `-webkit-mask-composite: xor`。
  解决：两条属性同时声明，并配合 `-webkit-mask` 双层 linear-gradient。
- 现象：iOS Safari 视频不自动播放。
  根因：未加 `muted` + `playsinline`。
  解决：`<video autoplay loop muted playsinline>` 三个属性缺一不可。

## 用户纠正 / 偏好
- 用户在原设计稿（React + shadcn/ui 方案）基础上明确表示「更偏向于静态网页」→ 本项目改为纯静态交付。

## 外部资源
- 背景视频：`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`
- 字体：Google Fonts（Instrumental Serif, Inter 400/500）
