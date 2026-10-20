# AGENTS.md — 城市行程规划单文件 HTML

## 项目简介

把「一座城市 + 天数 + 主题偏好」变成一页可直接打开的单文件 HTML 行程规划：左侧时间轴卡片（景点/美食/文化/购物四色分类），右侧腾讯地图按顺序打点连线，顶部 Tab 切换 DAY1/2/3，点击卡片地图飞行定位。视觉基调为 Stripe 风格（清爽、柔光渐变、克制动效）。

本文件夹当前产物：`index.html` —— 成都 3 日行程样例。

## 技术栈

- 语言：HTML5 + 原生 CSS（CSS 变量 / Grid / Flex / `@keyframes`）
- 交互：原生 JavaScript（无框架、无 jQuery、无构建工具）
- 地图：腾讯地图 JSAPI GL（全局命名空间 `TMap`）
- 依赖：无本地依赖；地图 SDK 与底图 Key 由运行环境提供（见「编码约定」）
- 运行环境：现代浏览器（需 WebGL）

## 目录结构

```
city-itinerary-planner/
├── AGENTS.md      # 本文件：项目规则
├── README.md      # 项目说明
├── MEMORY.md      # 长期上下文
└── index.html     # 全部内容：样式 + 结构 + 数据 + 逻辑（单文件）
```

配套技能（可复用的生成流程与设计规范）位于仓库 `.workbuddy/skills/city-itinerary-planner/`。

单文件是刻意选择：灵感类项目要能「一个文件丢给别人就能看」，不引入目录结构与构建链。

## 运行方式

- **推荐**：在 WorkBuddy 预览面板中打开 `index.html`（present_files 即可），地图 Key 由本地代理注入。
- **本地直开**：双击 `index.html` 亦可用，但地图与路线不会渲染——页面源码中不含明文 Key，本地无代理可转发请求，此时会显示兜底提示层。

## 编码约定

- **数据与视图分离**：所有行程数据集中在 `ITINERARY` 常量（数组 → 天 → POI），视图函数只消费数据；新增城市只改数据，不改渲染逻辑。
- **配色令牌集中在 `:root`**：四类 POI 各有一组 `--x-1` / `--x-2` / `--x-soft`（渐变起止色与浅底色），改配色只动这一处。
- **分类色语义单一来源**：`TYPE_META` 是四类 POI 的颜色与名称的唯一来源，卡片 chip、时间轴圆点、左侧色条、地图 Pin 全部由它派生，禁止在 CSS/JS 中另写一套色值。
- **地图 Key 零明文**：不得在 HTML 中写入任何真实 Key。默认走 `window._TMapSecurityConfig` 代理模式，占位符 `__WB_HTTP_PORT__` / `__WB_TMAP_SECRET__` 必须原样保留。
- **地图初始化禁项**：不使用 `mapStyleId`；不引用官方 demo 图片（`mapapi.qq.com/...`），Pin 一律用内联 SVG data URL 生成。
- **中文文案**：注释、文档使用中文；变量名、类名、文件名使用英文。

## 注意事项

- **信息窗换行**：腾讯地图会给自定义 InfoWindow 内容容器加 `white-space:nowrap`，中文会被截断。`.iw` 系列必须显式 `white-space:normal !important`。
- **图例位置**：腾讯地图的比例尺与版权信息固定在左下角，图例必须放右下角，否则重叠。
- **视野自适应**：`fitBounds` 的 `padding` 用数字形式（如 `{padding:80}`）；腾讯地图缩放到整数级，颗粒度较大，留白属正常现象，不要用负数或过小边距硬压。
- **地图容器高度**：`#map` 用 `position:absolute; inset:0` 撑满父级，父级高度由 flex 布局确定。若改成百分比高度，容器必须显式给出像素高度，否则地图不渲染。
- **路线兜底**：先画直线（保证「按顺序连线」必定可见），再用 `TMap.service.Driving` 异步替换为真实道路；切换天时用递增 token 丢弃过期响应。
