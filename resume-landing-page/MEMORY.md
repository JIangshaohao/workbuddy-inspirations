# MEMORY.md — 网页简历 Landing Page（Aurora 主题）

## 长期上下文

- 本灵感的定位：把简历转成**可投递的单页站点**，而不是"个人信息罗列"。
- 目标读者是招聘方（HR + 技术面试官），阅读路径为：10 秒看人 → 30 秒看量级 → 2 分钟看细节。
- 服务对象画像：Harrison Jiang，Java 后端工程师，JDK 1.8 存量系统为主战场，前端原生 JS + jQuery，习惯用 PowerShell / CMD 脚本消灭重复劳动。

## 架构决策

- 决策：`data.json` 作为唯一数据源，`output.html` 内嵌同名常量副本。
  ｜ 原因：`file://` 下 `fetch('data.json')` 会被 CORS 拦截，内嵌才能保证"双击即开"。
  ｜ 影响：内容是**双份维护**。改内容必须两处同步。若未来要接后端，可把 `RESUME_DATA` 换成 fetch 返回值。
- 决策：项目封面用纯 CSS 渐变生成（`art-1` ~ `art-6`），不用任何图片。
  ｜ 原因：约束要求零外链；AI 生图会破坏"单文件可投递"属性。
  ｜ 影响：视觉风格统一，但缺真实截图的说服力。需要时可换成 base64 内联图。
- 决策：主题色做成 4 套预设，由 CSS 变量 + `--primary-rgb` 双写驱动。
  ｜ 原因：需求明确要求"主色可替换"。
  ｜ 影响：新增颜色必须同时提供 hex 与 rgb 三元组，否则 `rgba(var(--primary-rgb),.12)` 会失效。
- 决策：保留参考模板的键名（`hero_card` / `stats_board` / `timeline_pro` / `skill_radar` / `bento_gallery` / `testimonial`）。
  ｜ 原因：这套 schema 已在别处复用，改名会破坏互换性。
  ｜ 影响：只能新增可选字段，不能重命名既有键。
- 决策：不用 React / Tailwind / GSAP。
  ｜ 原因：需求硬约束是单文件零外链；用户默认技术栈是原生 JS + jQuery。
  ｜ 影响：无构建链路，交出去就能用；代价是组件复用靠手写函数。

## 踩坑记录

- 现象：参考模板 `.quote .mark` 里写了 `font-family:'Inter',serif`，但主题明确禁用 Inter。
  ｜ 根因：模板残留。
  ｜ 解决：改为系统字体栈继承，用 `Georgia` 之类的 serif 回退也不需要，直接继承。
- 现象：计数动画遇到 `1,200h` 这类带千分位的值会解析成 `1`。
  ｜ 根因：`parseFloat("1,200")` 在逗号处截断。
  ｜ 解决：数值里不写千分位，统一用 `1200h`；动画函数只提取首个数字并保留前后缀。
- 现象：暗色主题直接打印会白底白字或大面积墨块。
  ｜ 根因：卡片背景是 `rgba(255,255,255,.04)`，文字是亮色。
  ｜ 解决：`@media print` 里整体重定义颜色变量为浅色方案，并隐藏固定定位导航与装饰层。

## 用户纠正 / 偏好

- 用户明确要求：单文件 HTML、CSS/JS 全内联、无外链、系统字体栈、响应式、尊重 `prefers-reduced-motion`、深色 + 渐变极光主题、主色可替换。
- 用户明确要求：同时产出 `data.json` 与 `output.html` 两个产物。
- 信息不足时按行业最佳实践补全，不要反复追问。

## 外部资源

- 参考模板（结构与 schema 来源）：
  - `https://static.workbuddy.cn/workbuddy/playbook/cases/frontend-dev-awwwards-resume-landing/output.html`
  - `https://static.workbuddy.cn/workbuddy/playbook/cases/frontend-dev-awwwards-resume-landing/data.json`
- 本地技能：`前端开发（frontend-dev）`，位于 `~/.workbuddy/skills/Frontend Dev · 前端与 AI 媒体/`
