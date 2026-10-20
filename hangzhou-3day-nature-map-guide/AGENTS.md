# AGENTS.md — 杭州三日自然山水游 · 地图行程指南

## 项目简介

单文件 HTML 地图行程指南：全屏腾讯地图 + 左侧悬浮行程面板，按天配色绘制编号标记与每日足迹路线，
面板站点与地图标记双向联动弹出信息卡片，右下角附手机端二维码。打开 `index.html` 即可使用。

## 技术栈

- 语言/框架：原生 HTML + CSS + JavaScript（无构建步骤、无第三方依赖）
- 地图底图：腾讯地图 JavaScript API GL（全局命名空间 `TMap`），走合规代理鉴权
- 运行环境：现代浏览器（需支持 WebGL）
- 依赖：无。地图 SDK 由页面运行时从官方 CDN 动态注入

## 目录结构

```
hangzhou-3day-nature-map-guide/
├── AGENTS.md     本文件：项目规则
├── README.md     面向读者的说明
├── MEMORY.md     长期上下文：决策 / 踩坑 / 偏好
└── index.html    唯一交付物（单文件，含内嵌行程 JSON 与二维码）
```

## 运行 / 构建方式

**运行**：双击 `index.html`（或拖进浏览器）。无构建步骤、无需起 http 服务。

**改数据**：直接编辑 `index.html` 中 `<script type="application/json" id="trip-data">` 内的行程 JSON。
站点字段为 `seq / name / lat / lng / desc / tags / tip / next`，其中 `next` 描述到下一站的
`mode / distance / duration / polyline`。改动后刷新页面即生效，无需重新生成。

## 编码约定

- 对话/注释/文档使用中文；代码、变量名、文件名使用英文。
- 地图鉴权固定使用合规代理模式：`window._TMapSecurityConfig.serviceHost` 指向本地代理服务，
  SDK `<script>` 地址**不带 `key` 参数**，前端不出现任何明文 Key。
- 行程数据以 `<script type="application/json">` 内嵌，不写成 JS 变量；文本注入 DOM 前统一 HTML 转义。
- 只用腾讯地图官方文档中登记的 API / 属性 / 事件，不自造属性。
- 不设置 `mapStyleId`（默认 Key 不支持自定义样式，会导致底图变灰）。

## 注意事项

- 地图容器必须有确定高度，否则底图整块空白。
- 自定义浮层 `z-index` 需大于 1000，否则被地图控件层遮挡、点击不响应。
- 折线样式有硬约束：`width` 为正整数、`borderWidth` 为非负整数，传小数该属性直接失效。
- `polyline` 为压缩增量格式：首点为绝对经纬度（纬度在前），其后每两个值为 (Δlng, Δlat)，单位 1e-6 度。
