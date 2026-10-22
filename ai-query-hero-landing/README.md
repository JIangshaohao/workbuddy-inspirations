# AI Query Hero Landing

> Transform Data Quickly — 全屏视频背景 + 毛玻璃搜索卡的单视口 AI 落地页 Hero

## 这是什么

复刻一份 Figma 级设计规格的单视口落地页首屏：**全屏循环视频背景 + 居中大标题 + 毛玻璃 AI 搜索卡**。

面向需要一个"产品气质 + 可交互搜索入口"同时到位的 AI 数据分析类产品的首屏。整页只有一个视口，没有后续内容区块——因为规格本身只定义了 Hero。

核心考点不在视觉，而在**背景视频的自研淡入淡出系统**：一套不依赖 CSS transition 的 `requestAnimationFrame` 动画控制逻辑，负责让 11 秒的视频在循环边界处平滑过渡（先淡出 → 归零 → 重播 → 再淡入），而不是生硬地跳帧。

## 效果 / 截图

- 背景为绿色山谷航拍 MP4（1928×1072 / 24fps / 11.04s），铺满视口并放大到 115%，顶部锚定取景
- 顶部导航：Logoipsum 字标 + 5 个菜单项（Features 带 chevron 下拉）+ Sign Up / Log In 双 CTA
- 主标题 "Transform Data Quickly"（Fustat Bold 80px，字距 -4.8px），下方 542px 宽副标题
- 搜索卡：暗色半透明 + 背景模糊，内部含额度行（绿色 Upgrade 按钮）、白色输入区、Attach / Voice / Prompts 工具行与字数统计

## 使用方式

```bash
cd ai-query-hero-landing
python -m http.server 5181
# 浏览器访问 http://127.0.0.1:5181
```

页面需联网：背景视频走 CloudFront，字体走 Google Fonts，样式走 Tailwind CDN。

## 技术要点

- **视频淡入淡出（自研 rAF）**：`fadeTo(target, duration)` 从**当前 opacity** 出发渐变（新动画先 `cancelAnimationFrame` 掉旧帧，避免两个动画抢同一个属性），不出现跳变。触发点：`canplay` 淡入；`timeupdate` 检测到距结尾 ≤ 0.55s 时淡出（`fadingOut` 标志位防止重复触发）；`ended` 时归零 → 100ms → `currentTime = 0` 重播 → 再次淡入。
- **无 CSS transition**：视频的透明度变化完全由 JS 驱动，`transition-duration` 实测为 `0s`。
- **字体分工**：Fustat（标题/副标题）、Schibsted Grotesk（导航与额度行）、Inter（徽章）、Noto Sans（正文与工具按钮），四套字体各 400/500/600/700 七档权重。
- **图标**：全部内联 SVG（Lucide 风格路径，`currentColor` 描边），不引第三方图标库。
- **交互**：Features 下拉（hover / focus-within / 点击三种触发）、输入字数实时统计（千分位格式）、提交与 CTA 的 `active:scale` 触感反馈。

## 验收

仓库内附两个 CDP 验收脚本（需先起本地服务器）：

```bash
node tools/verify.js        # 多断点截图 + 关键样式断言（尺寸/字号/字距/颜色/间距）
node tools/verify-fade.js   # 淡入淡出逻辑的 6 项确定性断言
```

`tools/probe-fade.js` 为调试用探针，可打印 opacity 时间序列。
