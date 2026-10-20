# MEMORY.md — 城市行程规划单文件 HTML

## 长期上下文

- 这是一个「灵感项目」，一个灵感一个文件夹，整体上传 GitHub。仓库级规则见根 `AGENTS.md`。
- 产物形态固定为**单文件 HTML**：所有 CSS/JS 内联，双击可开。
- 当前样例为成都 3 日行程；模板本身与城市无关，换城市只需替换 `ITINERARY` 数据。
- 本灵感同时被封装为可复用技能，位于仓库 `.workbuddy/skills/city-itinerary-planner/`。

## 架构决策

- **决策**：视图层不做城市特判，全部由 `ITINERARY` 数据驱动 ｜ 原因：用户会持续用同一灵感产出不同城市的行程页，数据/视图分离是唯一能规模化的路径 ｜ 影响：新增城市零改动 JS 逻辑，只增数据。
- **决策**：`TYPE_META` 作为四类 POI 配色的单一来源 ｜ 原因：同一分类色要在 chip、圆点、色条、地图 Pin 四处保持一致，硬编码必漂移 ｜ 影响：改配色只改一处，但新增分类必须同时补 `TYPE_META` 与 `.chip` 相关样式。
- **决策**：地图 Key 走 `_TMapSecurityConfig` 代理模式，HTML 零明文 Key ｜ 原因：合规红线（腾讯地图/高德/百度/天地图等白名单 + 禁止内置可用 Key）；本地直开时地图不可用属可接受代价 ｜ 影响：页面必须在 WorkBuddy 预览面板中查看；本地直开需显示兜底提示层。
- **决策**：路线「先直线兜底 → 再驾车路线升级」 ｜ 原因：`TMap.service.Driving` 依赖网络与配额，失败时不能让「按顺序连线」这个核心需求消失 ｜ 影响：切天瞬间是直线，数百毫秒后变为沿路折线；用自增 `routeToken` 丢弃过期响应。
- **决策**：Pin 用内联 SVG data URL，不用官方 demo 图片 ｜ 原因：合规要求禁止引用 `mapapi.qq.com/...` demo 资源，且 SVG 可随分类色动态生成 ｜ 影响：`pinSvg()` 承担「序号 + 分类渐变」两件事。

## 踩坑记录

- **现象**：自定义信息窗里的中文被横向截断成一行。｜ 根因：腾讯地图给 InfoWindow 内容容器注入了 `white-space:nowrap`。｜ 解决：`.iw, .iw *{ white-space:normal !important; word-break:break-word; }`。
- **现象**：图例与地图左下角的比例尺、版权信息重叠。｜ 根因：腾讯地图的比例尺和 attribution 固定在左下角。｜ 解决：图例改放右下角。
- **现象**：`fitBounds` 后地图四周留白偏大。｜ 根因：腾讯地图缩放按整数级，`fitBounds` 只能取不小于范围的最小整数级，颗粒度天然较粗；同时地图容器横宽比大于当日 POI 包围盒横宽比，横向必然留白。｜ 解决：接受为正常现象，`padding` 保持 80（数字形式），不要用过小边距硬压。
- **现象**：`banner-title` 里的强调文字被渲染成斜体。｜ 根因：用了 `<em>` 标签且未重置 `font-style`。｜ 解决：给 `.accent` 加 `font-style:normal`。
- **现象**：地图未就绪时点击 Tab 会抛异常。｜ 根因：`switchDay` 在 `mapReady` 判断之前调用了 `infoWindow.close()`。｜ 解决：把关闭信息窗移到 `mapReady` 判断之后。

## 用户纠正 / 偏好

- 用户明确要求视觉参考 **Stripe 风格**：清爽、柔光渐变、克制。不要浓烈的高饱和撞色。
- 用户明确要求地图底图必须用**腾讯地图**（同时满足合规白名单）。
- 用户偏好：结论先行、保持简单、精准修改。生成页面前先确认坐标真实（用地图服务解析），不要凭记忆写经纬度。
- 交互要求：点击左侧卡片必须让地图**飞到**对应位置（不是简单切换视野），并同步高亮卡片。

## 外部资源

- 腾讯地图 JSAPI GL 文档：https://lbs.qq.com/webApi/javascriptGL/glGuide/glOverview
- 腾讯地图 Key 代理（前端零明文）：https://lbs.qq.com/webApi/javascriptGL/glGuide/glKeyDelegate
- 视觉参考（同族灵感产物）：Stripe 风格行程页参考样例 —— 由 WorkBuddy 官方 playbook 提供的 `travel-itinerary-planner/output.html`。
- 用户自身的相关产物：腾讯文档《上海沿海骑行_5日行程》（`docs.qq.com/page/DZkZ0bGVia3NPWENz`）。
- 数据来源：POI 坐标由腾讯位置服务 WebService `geocoder` / `place/search` 解析，坐标系 GCJ-02。
