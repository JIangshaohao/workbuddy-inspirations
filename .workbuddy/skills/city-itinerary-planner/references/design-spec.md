# 设计规范 — Stripe 风格行程页

本文件是 `city-itinerary-planner` 的视觉与布局契约。模板文件 `<repo>/city-itinerary-planner/index.html` 即按本规范实现；从零实现时必须逐条遵守。

## 一、设计令牌

```css
:root{
  /* 基础 */
  --bg:#F6F9FC;           /* 页面底色（浅灰蓝，Stripe 官网同款） */
  --surface:#FFFFFF;      /* 卡片 */
  --navy:#0A2540;         /* 主文字（深靛蓝，不用纯黑） */
  --slate:#425466;        /* 正文 */
  --muted:#7A8B9E;        /* 次要文字 */
  --line:#E6EBF1;         /* 常规描边 */
  --line-soft:#EEF2F7;    /* 更浅的分隔线 */
  --blurple:#635BFF;      /* Stripe 主色 */
  --cyan:#22D3EE;         /* 渐变收尾色 */

  /* 四类 POI：各一组 [渐变起色, 渐变止色, 浅底色, 深色文字] */
  --scenic-1:#34D399;  --scenic-2:#059669;  --scenic-soft:#ECFDF5;  --scenic:#059669;
  --food-1:#FBBF24;    --food-2:#EA580C;    --food-soft:#FFF7ED;    --food:#EA580C;
  --culture-1:#8B85FF; --culture-2:#4F46E5; --culture-soft:#EEF0FF; --culture:#4F46E5;
  --shop-1:#F472B6;    --shop-2:#DB2777;    --shop-soft:#FDF2F8;    --shop:#DB2777;

  /* 圆角 */
  --r-lg:20px;  --r-md:14px;  --r-sm:10px;

  /* 阴影：三级，全部带蓝调而非纯黑 */
  --sh-1:0 1px 2px rgba(10,37,64,.05), 0 1px 3px rgba(10,37,64,.04);
  --sh-2:0 4px 12px rgba(10,37,64,.06), 0 1px 3px rgba(10,37,64,.05);
  --sh-3:0 12px 34px rgba(10,37,64,.10), 0 2px 6px rgba(10,37,64,.05);
}
```

**硬性约束**

- 分类色的唯一来源是一个 JS 表 `TYPE_META`，卡片刻度、时间轴圆点、左侧色条、地图 Pin 全部由它派生。禁止在 CSS 中另写一套四类色。
- 阴影一律使用带蓝调（`rgba(10,37,64,α)`）的阴影，禁止纯黑阴影，否则失去 Stripe 的通透感。
- 圆角：大容器 20px，卡片 14px，小控件 10px。

## 二、页面骨架

```
body (bg: --bg, padding: 18px 26px)
└── .page  (max-width 1500px; height 100%; flex column; gap 14px)
    ├── header.banner      flex-shrink:0   ← 顶部 Banner
    ├── nav.tabbar         flex-shrink:0   ← DAY Tab 分段控件（居中）
    └── .main              flex:1; min-height:0
        ├── aside.sidebar  width:418px; flex-shrink:0
        │   ├── .sidebar-head   当日标题 + POI 数
        │   └── .timeline       flex:1; overflow-y:auto  ← 时间轴卡片
        └── section.map-wrap    flex:1; position:relative
            ├── #map            position:absolute; inset:0
            ├── .map-chip       左上角：当日概况
            ├── .map-legend     右下角：四色图例
            └── .map-fallback   地图不可用时的兜底层
```

**关键布局规则**

- `.page` 用 `height:100%` 而非 `100vh`，配合 `html,body{height:100%}` 与 `*{box-sizing:border-box}`，避免 body 内边距造成的溢出。
- `.main` 必须 `min-height:0`，否则 flex 子项不会收缩，`.timeline` 的 `overflow-y:auto` 失效。
- `#map` 用 **绝对定位撑满** `.map-wrap`，保证拿到确定的像素高度（腾讯地图容器无高度则不渲染）。
- 响应式断点：`≤1240px` 徽章由绝对定位改为静态（避免压标题）；`≤1080px` `.main` 改纵向、侧栏与地图各给固定高度。

## 三、Banner

- 底色：三层低透明度 `radial-gradient`（blurple 左上、cyan 右上、pink 左下）+ 一层 `linear-gradient(180deg,#FFFFFF,#F7FAFF)`，形成柔光渐变。
- 叠一层 `::after` 白色线性渐变（从上到下 65% → 0），制造顶部玻璃反光。
- 内容：`flex column` + `align-items:center` + `justify-content:center`，标题真正居中；`min-height:196px`。
- 标题：46px / 800 / `letter-spacing:-.6px` / 颜色 `--navy`；强调词用 `.accent` 做 blurple→cyan 渐变文字（`background-clip:text`），并显式 `font-style:normal`。
- 徽章 `.banner-meta`：绝对定位在右侧（`right:32px; top:50%; transform:translateY(-50%)`），毛玻璃（`backdrop-filter:blur(16px)`）+ 半透明白底 + `--sh-3`，内部各项用 1px 分隔线区隔；数字 25px/800，标签 11.5px `--muted`。
- 徽章内容固定三项：**天数** / **必打卡 POI 数** / **人均预算**（预算用 `<i>¥</i>` 降低货币符号字号）。

## 四、DAY Tab

- 居中分段控件：外层 `.day-tabs` 浅灰底 `#EDF1F7` + 5px 内边距 + 15px 圆角，内部各项 11px 圆角。
- 未选中：透明底、灰色文字；`:hover` 半透明白。
- 选中：白底 + `--sh-2` 阴影；左侧 `D1/D2/D3` 徽标由灰底切换为 blurple 渐变白字。
- 每项两行：上行 `DAY 1 · 10/09`（10.5px 大写字距），下行当日主题（13.5px/600）。

## 五、时间轴（左侧）

网格三列：`grid-template-columns:48px 26px 1fr`（时间 / 轨道 / 卡片）。

- **轨道竖线**：`.tl-rail::before` 绝对定位在轨道列中线，`top:0; bottom:0`，2px 宽 `#E3E9F2`。首行 `top:26px`（从圆点起），末行 `height:26px`（到圆点止）。
- **圆点**：11px，白底 + 2.5px 分类色描边；选中态填充分类色并加一圈浅色光晕。
- **卡片**：白底、14px 圆角、1px `--line` 描边；左侧 3px 分类色竖条（`::before`）。
- **选中态 `.on`**：描边换分类色 + 浅色渐变底（`linear-gradient(135deg, var(--tc-soft), #fff 62%)`）+ 外发光 `0 0 0 3px var(--tc-soft)`。
- **入场动效**：`.tl-row` 位移 9px 淡入 0.42s，`animation-delay = index * 46ms`。
- 卡片内容：分类 chip + 名称 + 建议时长（一行）→ 一句话卖点（最多两行截断）→ 「门票 / 位置」元信息行。

## 六、地图侧

- Pin：34×44 內联 SVG 水滴，分类色纵向渐变，白描边 2.4px，内部白色圆 + 分类色序号；`anchor:{x:17,y:42}`。
- 路线：`color:'#635BFF', width:7, borderWidth:4, borderColor:'#ffffff', lineCap:'round', showArrow:true, arrowOptions:{space:70}`。
- `.map-chip`（左上）：毛玻璃小卡，显示 `DAY N · N 个站点 · 首站时间 出发`。
- `.map-legend`（**右下**）：毛玻璃小卡，四个 9px 圆角色块 + 分类名。
- `.map-fallback`：地图 SDK 未加载时盖在 `#map` 之上的提示层（`z-index:30`），说明需在 WorkBuddy 预览面板中打开。

## 七、信息窗（InfoWindow）

- 宽度 256px，圆角由 SDK 提供。
- 结构：序号徽标 + 时间/分类 → 名称（14px/700 `--navy`）→ 详情（12px/1.6）→ 分隔线 + 时长与门票。
- **必须**加 `.iw, .iw *{ white-space:normal !important; word-break:break-word; }`。

## 八、动效纪律

| 场景 | 时长 | 缓动 |
| --- | --- | --- |
| 卡片入场 | 0.42s | `cubic-bezier(.22,.61,.36,1)` |
| 卡片 hover 位移 | 0.2s | `ease` |
| Tab 切换 | 0.22s | `ease` |
| 地图飞行 `easeTo` | 0.76s | SDK 默认 |
| 地图 fitBounds 前平移 | 0.52s | SDK 默认 |

必须提供 `@media (prefers-reduced-motion:reduce){ *{ animation:none!important; transition:none!important; } }`。
