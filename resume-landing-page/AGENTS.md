# AGENTS.md — 网页简历 Landing Page（Aurora 主题）

## 项目简介

把一份简历／职业描述转化为 **Landing Page 风格的网页简历**：金字塔叙事骨架，深色极光渐变主题，单文件可直接投递。

## 技术栈

- 语言/框架：纯 HTML + CSS + 原生 JavaScript（**不使用** React / 构建工具 / 包管理器）
- 运行环境：任意现代浏览器（Chrome / Edge / Safari / Firefox 近两年版本）
- 依赖：**零依赖**。无 CDN、无外链字体、无外部图片、无 npm 包

## 目录结构

```
resume-landing-page/
├── AGENTS.md      # 本文件
├── README.md      # 面向读者的说明
├── MEMORY.md      # 长期上下文
├── data.json      # 结构化简历数据（可替换复用，单一数据源）
└── output.html    # 最终产物：单文件网页简历
```

## 运行 / 构建方式

无需构建。直接双击 `output.html` 或用浏览器打开即可。

```bash
# 本地预览（可选）
python -m http.server 8080 --directory E:/VibeCoding/Workbuddy/resume-landing-page
# 然后访问 http://localhost:8080/output.html
```

## 数据流约定（重要）

- `data.json` 是**唯一数据源**，供外部工具／其他页面消费。
- `output.html` 中内嵌一份 `RESUME_DATA` 常量，与 `data.json` **内容必须保持一致**。
- 之所以内嵌而不 `fetch('data.json')`：`file://` 协议下浏览器会以 CORS 拦截本地 JSON 读取，内嵌才能保证"双击即可打开"。
- **修改内容的正确姿势**：改 `data.json` → 把同一份 JSON 复制进 `output.html` 的 `RESUME_DATA` 常量。

## 编码约定

- 单文件：CSS 写在 `<style>`，JS 写在 `<script>`，**禁止任何外链**（`<link href="http...">`、`<script src="http...">`、CDN、图床占位 URL 一律禁止）。
- 字体：只用**系统字体栈**（`-apple-system / Segoe UI / PingFang SC / Microsoft YaHei` 等），不引外部字体。
- 颜色：全部走 CSS 自定义属性（`--primary` / `--secondary` / `--accent` / `--bg` ...）。主色替换只需改 `THEMES` 预设或 `:root` 变量。
- 命名：HTML class 用 kebab-case；JS 变量用 camelCase；文件用小写英文。
- 动画只允许动 GPU 属性（`transform` / `opacity` / `filter`），**禁止**动 `width` / `height` / `top` / `left`。
- 所有动画必须包在 `@media (prefers-reduced-motion: reduce)` 的关闭逻辑内。
- **禁止 emoji**。图标一律用内联 SVG。
- 无内容时必须渲染空状态（`empty-state`），不允许出现空白块。

## 注意事项

- `output.html` 里的 `xmlns="http://www.w3.org/2000/svg"` 是 SVG 命名空间标识，不是外链，不要删。
- 修改主题色时，除了改 `--primary`，还要同步改 `--primary-rgb`（用于 `rgba()` 透明度叠加）。
- 打印样式（`@media print`）会把暗色主题翻转为浅色，便于导出 PDF；改动颜色变量时注意别破坏它。
- 简历中的公司名一律使用「某 XX 公司」占位写法，替换真实信息时保持同一格式即可。
