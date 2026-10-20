---
name: city-itinerary-planner
description: 生成城市多日旅游行程规划单文件 HTML —— Stripe 风格（清爽、柔光渐变），顶部 Banner 大标题 + 徽章，左侧四色分类时间轴卡片，右侧腾讯地图按顺序打点连线，顶部 DAY Tab 切换，点击卡片地图飞行定位。当用户要求「做一份 XX 城市 N 日行程 / 旅游攻略 / 出行规划的单文件 HTML 页面」「行程规划可视化」「itinerary HTML page」时使用。
---

# 城市行程规划单文件 HTML 生成器

把「城市 + 天数 + 主题偏好」变成一页可直接打开、可交互的行程看板。

## 何时使用

用户提到以下任一意图时使用本技能：

- 「帮我做一个 XX 3 日旅游行程规划单文件 HTML」
- 「XX 城市 N 天攻略，左侧时间轴右侧地图」
- 「行程规划页面 / 旅游行程可视化 / 出行看板」
- 已有的行程页需要**换城市**或**改视觉**

不适用：只需要文字攻略（不要求 HTML 页面）、只想查天气/路线（直接用腾讯地图能力即可）。

## 核心产物形态（硬性）

1. **单文件 HTML**：CSS / JS 全部内联，无外部资源（地图 SDK 除外），双击可开。
2. **数据与视图分离**：行程数据集中在一个 `ITINERARY` 常量；渲染逻辑与城市无关。
3. **地图必须是腾讯地图 JSAPI GL**（命名空间 `TMap`），且 **HTML 中零明文 Key**。

## 工作流

### 步骤 1 — 明确需求

从用户描述中确定：城市、天数、主题偏好（历史文化 / 美食 / 自然 / 夜生活 / 购物）、预算口径。
用户没说全时按以下默认值推进，不要停下来追问：天数默认 3 天；每天 6 个 POI；主题默认覆盖「历史文化 + 美食 + 自然 + 夜生活」四类；预算为人均 3 天合计（含门票、餐饮、交通、住宿）。

### 步骤 2 — 解析真实坐标（不可跳过）

**绝不允许凭记忆写经纬度。** 必须用地图服务解析：

1. 加载 `腾讯地图·地图助手` 技能（`tencentmap-map-assistant`）。
2. 对每个 POI 先调 `geocoder(address)` 拿坐标；对「南桥」「西街」这类同名地点，`geocoder` 容易落到行政区中心点（返回 `level` 值偏低），此时改用 `poi_search(keyword, region=城市)` 取 `data[0].location`。
3. 校验：`level >= 10` 且 `district` 落在目标城市内才可采用；否则重查。
4. 坐标是 **GCJ-02**，直接用于地图渲染。

若用户提供的是 GPS / WGS-84 坐标，先用 `coord_translate(type=1)` 转换。

### 步骤 3 — 组装数据

按 `references/data-schema.md` 构造 `ITINERARY`。要点：

- 每天一个 `day` 对象，`pois` 按**时间顺序**排列。
- 每个 POI 必须有 `time` / `typeKey` / `name` / `desc` / `lat` / `lng` / `duration` / `ticket` / `addr` / `intro`。
- `typeKey` 只能是 `scenic` / `food` / `culture` / `shop`。
- 行程编排要顺路：同一天的点在地理上应聚集，避免来回穿越城市。

### 步骤 4 — 套用模板

1. 读取模板文件 `<repo>/city-itinerary-planner/index.html`（单文件模板，含全部样式与逻辑）。
2. 整体复制为新文件，**只替换**：
   - `TRIP` 常量（城市、tag、标题、副标题、初始中心点）
   - `ITINERARY` 常量（行程数据）
   - `<title>` 与 `BUDGET` 常量
3. **不要改动**渲染逻辑、CSS 令牌结构与地图初始化代码。如果用户要求改配色，只改 `:root` 与 `TYPE_META`。

若工作区中没有该模板文件，按 `references/design-spec.md` 从零实现，逐条遵守其中的硬性规则。

### 步骤 5 — 渲染校验（必做）

用本机 Chrome 无头模式截图，人眼确认后再交付：

```bash
# 1. 生成 QA 副本：把代理占位符替换为直连 Key，仅用于本地渲染，不要写回成品
# 2. 截图
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new --disable-gpu --enable-unsafe-swiftshader --hide-scrollbars \
  --no-sandbox --window-size=1600,1000 --virtual-time-budget=16000 \
  --screenshot="shot.png" "file:///<qa-copy>.html"
```

必须逐项确认：

- [ ] Banner 大标题居中、徽章不压标题
- [ ] 三个 DAY Tab 可切换，列表与地图同步刷新
- [ ] 时间轴竖线连续、圆点与卡片首行对齐、无断裂
- [ ] 地图 Pin 有序号且按分类配色，路线连线按顺序贯通
- [ ] 点击卡片 → 地图飞行到该点 + 信息窗展开 + 中文正常换行
- [ ] 图例在**右下角**（左下角被地图比例尺占用）

### 步骤 6 — 交付

1. 删除 QA 副本，确认成品 HTML **不含任何明文 Key**（正则 `gljs\?[^"']*[?&]key=[A-Z0-9-]{20,}` 应无命中）。
2. 调用 `present_files` 打开成品 HTML 预览。
3. 说明产出文件路径与数据规模（天数 / POI 数 / 预算）。

## 地图集成与合规红线

| 规则 | 说明 |
| --- | --- |
| 底图 | 只能用腾讯地图 JSAPI GL；禁止 Google / Apple / Bing 海外版 / Mapbox / Leaflet+OSM 等未取得国内测绘资质的服务 |
| Key | **HTML 中禁止出现明文 Key**。默认走 `window._TMapSecurityConfig` 代理模式，占位符 `__WB_HTTP_PORT__` / `__WB_TMAP_SECRET__` 原样保留，由运行时替换 |
| 坐标系 | GCJ-02 |
| 库 | 需要路线/搜索时在 SDK URL 加 `libraries=service` |
| 样式 | **不要设置 `mapStyleId`**，自定义样式需在腾讯位置服务控制台为 Key 单独开通 |
| 图标 | 禁止引用 `mapapi.qq.com/...` 官方 demo 图片，一律用内联 SVG data URL |
| 服务调用 | 路线规划等服务必须走 SDK 类（`TMap.service.Driving` 等），不要手工拼接代理 URL |
| 容器高度 | 地图容器必须有确定高度（推荐 `#map{position:absolute; inset:0}`），否则不渲染 |
| 内容合规 | 不标注军事禁区 / 涉密坐标；不批量采集、公开他人位置信息 |

SDK 引入模板（照抄，两个标签的顺序不能颠倒）：

```html
<script>
  window._TMapSecurityConfig = {
    serviceHost: 'http://127.0.0.1:__WB_HTTP_PORT__/_TMapService/_wbt/__WB_TMAP_SECRET__'
  };
</script>
<script charset="utf-8" src="https://map.qq.com/api/gljs?v=1.exp&libraries=service"></script>
```

## 视觉规范

完整设计令牌与 CSS 骨架见 `references/design-spec.md`。要点：

- 基调：Stripe 风格。浅色背景 `#F6F9FC`、白色卡片、主色 blurple `#635BFF`、深色文字 `#0A2540`、次要文字 `#425466`。
- Banner：浅色柔光渐变（三层低透明度 radial-gradient + 一层线性渐变），标题居中放大，徽章浮在右侧。
- 四类 POI 配色固定：景点绿 `#059669` / 美食橙 `#EA580C` / 文化紫 `#4F46E5` / 购物粉 `#DB2777`。
- 动效克制：卡片入场 0.42s 位移淡入（按序号 46ms 递增延迟），地图飞行 0.76s，其余 hover 过渡 0.2s。必须支持 `prefers-reduced-motion`。

## 数据契约

见 `references/data-schema.md`。

## 已知坑（务必规避）

1. **信息窗中文不换行**：腾讯地图给自定义 InfoWindow 容器注入 `white-space:nowrap`，必须显式重置：`.iw, .iw *{ white-space:normal !important; word-break:break-word; }`。
2. **图例与比例尺重叠**：比例尺与版权信息固定在左下角 → 图例放右下角。
3. **`fitBounds` 留白偏大**：缩放按整数级 + 容器横宽比与 POI 包围盒横宽比不一致，留白属正常，不要用负 padding 硬压。`padding` 传数字（如 `80`）。
4. **快速切天串线**：异步路线响应可能晚于下一次切换，用自增 `routeToken` 比对后丢弃过期结果。
5. **强调文字变斜体**：`.accent` 若用 `<em>` 承载，需补 `font-style:normal`。
6. **地图未就绪时切 Tab 抛错**：`switchDay` 中关闭信息窗等地图操作必须放在 `mapReady` 判断之后。
