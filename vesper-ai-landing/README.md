# vesper-ai-landing

> 单视口视频背景落地页 —— Intelligence Designed To Evolve

## 这是什么

一款 AI 平台落地页的视觉复刻：第一屏即全部内容——CloudFront 全屏循环视频作为背景，其上叠加三段式 UI：

1. **Header**：白底圆形 logo、白色胶囊导航（激活项下方三枚黑点指示）、深色 Sign in 胶囊。
2. **Hero**：微软/亚马逊/谷歌品牌叠环 + 「Trusted by 2000+ Enterprises」胶囊、点阵显示字体的两行纯白标题、副标题与发光 CTA。
3. **Stats**：四组指标（120ms 推理延迟 / 99.99% 可用性 / 24/7 自主运行 / 2.4M 上下文窗口），进入视口后数字滚动到终值。

面向「想保留参考级单屏落地页结构」的场景：无框架、零构建，文件即规格。

## 效果

- 桌面（1280×900）：`_preview_desktop.png`
- 移动端（600×860）：`_preview_mobile.png`

## 使用方式

双击 `index.html` 或拖入浏览器。**需要联网**——背景视频与字体/图标样式表均来自 CDN。

## 技术要点

- **字体分层**：标题用 BubbledotICG-FinePos（OnlineWebFonts CDN 点阵字体），本地 `GeistPixel-Circle.woff2` 仅作兜底；UI 用 Inter。
- **入场动效**：`.anim` 统一 reveal（blur + 上移），标题逐行 `headlineFade`，CTA 用 `revealPulse` 脉冲入场。
- **数字滚动**：IntersectionObserver（threshold 0.25）触发一次，easeOutCubic，时长 `1500+i·80ms`、起始偏移 `480+i·90ms`。
- **移动端 ≤720px**：桌面导航隐藏，汉堡按钮切换固定遮罩 + 白色 sheet 菜单（overlay / Escape / 链接点击 / resize 关闭）。
- **可访问性**：`prefers-reduced-motion` 下全部动效降级为终态，标题保持纯白。
- **验证**：无头 Chrome 真实渲染截图 + `scrollWidth == innerWidth` 溢出量测，桌面与移动均无横向溢出。
