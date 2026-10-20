# MEMORY.md — 杭州三日自然山水游 · 地图行程指南

## 长期上下文

- 交付物是**单文件 HTML**，双击即可打开；地图 SDK 运行时从官方 CDN 动态注入，不起 http 服务。
- 地图鉴权固定为腾讯地图官方 `_TMapSecurityConfig` 代理模式，前端零明文 Key。
  `serviceHost` 里的 `__WB_HTTP_PORT__` / `__WB_TMAP_SECRET__` 是运行环境占位符，**不要替换成真实值**。
- 行程为固定内容：Day1 西湖经典线、Day2 龙井九溪线、Day3 西溪植物园线，共 12 站、约 55 km。

## 架构决策

- 决策：不复用 skill 参考产物里的通用 `GuideMap` 组件（约 1800 行），改为按需自写渲染逻辑。
  ｜ 原因：需求要求信息卡片含「亮点标签 / 到达贴士」、面板含段间交通行，而该组件的窗体模板固定、不可插槽，
  改造它的侵入面大于自写。
  ｜ 影响：单文件体积从 ~180KB 降到 ~110KB（其中二维码占 84KB），逻辑可读、易改。
- 决策：站点编号采用**全局序号 1–12**（跨天连续），而非每天 1–4。
  ｜ 原因：与统计口径「12 站」一致，跨天找点更快。
  ｜ 影响：面板与地图标记编号完全一致。
- 决策：编号直接烘焙进 SVG 图钉，而不是用 `MarkerStyle` 的文本属性 + `direction/offset` 定位。
  ｜ 原因：文本在缩放、碰撞避让下会漂移；烘焙进图片后视觉绝对稳定。
- 决策：段间路线数据沿用源行程提供的真实道路 `polyline`，仅对 < 300 m 的相邻段将方式归一为「步行」。
  ｜ 原因：7 米、38 米的相邻点之间不存在真实的驾车行为，标「驾车」会失真；距离与总里程不变。
  ｜ 影响：总里程仍为 55 km，与统计一致。

## 踩坑记录

- 现象：多份腾讯地图示例里 `polyline` 字段长度巨大且数值很小，直接当坐标画会跑到南极。
  ｜ 根因：该字段是压缩增量格式 `lat0,lng0,dLng1,dLat1,...`（单位 1e-6 度），不是 `lat,lng` 交替。
  ｜ 解决：首点取绝对值，其后每两项分别累加到 `lng` / `lat`。
- 现象：`hsl()` 传给 `TMap` 的 `color` 类字段会渲染成白色。
  ｜ 根因：JSAPI 只接受 `rgb()/rgba()/#RRGGBB`。
  ｜ 解决：本项目配色一律写成十六进制，从源头规避。
- 现象：`borderWidth: 1.4` 不报错但白边不画。
  ｜ 根因：折线样式约束——`width` 正整数、`borderWidth` 非负整数，小数直接失效。
  ｜ 解决：一律传整数。

## 用户纠正 / 偏好

- （暂无）

## 外部资源

- 腾讯地图 JSAPI GL 总览：https://lbs.qq.com/webApi/javascriptGL/glGuide/glOverview
- Key 代理配置：https://lbs.qq.com/webApi/javascriptGL/glGuide/glKeyDelegate
- 地图合规要求（底图白名单、Key 安全、无明文 Key）：WorkBuddy `geo-map-compliance-guard` skill
- 行程数据来源：腾讯位置服务 AI 旅游攻略（`travel_guide`）产物，站点坐标与段间路线为 GCJ-02。
