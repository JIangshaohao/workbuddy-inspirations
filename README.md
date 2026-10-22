# WorkBuddy 灵感工作区

> 一灵感一文件夹：8 个可直接打开的前端实验，纯前端、零构建、零外链。

![灵感数量](https://img.shields.io/badge/%E7%81%B5%E6%84%9F-9-3B7BF6)
![构建](https://img.shields.io/badge/build-none-success)
![依赖](https://img.shields.io/badge/dependencies-zero-success)

## 这是什么

这是一个**个人灵感仓库**。每个子目录是一个彼此独立的小项目，用来验证一个具体的想法：一个交互、一种版式、一份数据报告，或者一条纯前端算法管线。

这些灵感没有统一的框架和技术选型，只有一个共同点：**产出是一个可以直接双击打开的单文件 HTML**。不需要 `npm install`，不需要本地服务器，不需要联网（例外见「运行条件」列）。

## 项目索引

| 项目 | 内容 | 入口文件 | 技术要点 | 运行条件 |
| --- | --- | --- | --- | --- |
| [css-loading-animations](./css-loading-animations) | 8 种纯 CSS 加载动画参考页，支持一键复制样式 | `index.html` | 纯 CSS `@keyframes`，零 JS 依赖 | 双击即开 |
| [city-itinerary-planner](./city-itinerary-planner) | 城市多日行程规划页（样例：成都 3 日），时间轴与地图双向联动 | `index.html` | 原生 JS + 腾讯地图 JSAPI GL | 地图需 WorkBuddy 预览环境注入 Key |
| [resume-landing-page](./resume-landing-page) | 网页简历 Landing Page，金字塔叙事骨架 + 深色极光主题 | `output.html`（数据 `data.json`） | 内联 CSS + 原生 JS，数据视图分离 | 双击即开 |
| [colorharbor-palette](./colorharbor-palette) | ColorHarbor 配色收藏库，30 组配色暗色画廊 + 详情预览 | `index.html` | 纯 CSS Masonry + 原生 JS | 双击即开 |
| [hangzhou-3day-nature-map-guide](./hangzhou-3day-nature-map-guide) | 杭州三日自然山水游地图指南，3 天 12 站点行程与地图同屏联动 | `index.html` | 原生 JS + 腾讯地图 JSAPI GL | 地图需 WorkBuddy 预览环境注入 Key |
| [netmusic-listening-portrait](./netmusic-listening-portrait) | 网易云音乐「你的听歌画像」数据报告，8 年 10 个月真实数据 | `index.html`（约 190 KB，图片全内联） | 构建期 Node 预渲染 + 内联 SVG | 双击即开，离线可读 |
| [ganfan-blindbox-workbench](./ganfan-blindbox-workbench) | 「吃了吗您」干饭盲盒工作台，抽卡决定吃啥 + 饭票透支记账 | `output.html` | 单文件 HTML + 资料库运行时 SDK | 需在 WorkBuddy 资料库中打开（依赖在线数据表） |
| [old-photo-restoration](./old-photo-restoration) | 老照片修复工作台，浏览器端四步修复管线，全程不上传 | `index.html`（CLI：`scripts/beautify.py`） | 原生 JS Canvas 自实现算法 + Python OpenCV 参考实现 | 网页双击即开；CLI 需 Python + OpenCV |
| [vesper-ai-landing](./vesper-ai-landing) | 单视口视频背景落地页，点阵标题 Hero + 四项统计区（AI 平台 Landing） | `index.html`（样式 `styles.css`、逻辑 `main.js`） | 原生 HTML/CSS/JS；CloudFront 全屏背景视频 | 双击即开，需联网（视频与字体/图标走 CDN） |

## 快速开始

```bash
git clone https://github.com/JIangshaohao/workbuddy-inspirations.git
cd workbuddy-inspirations
```

然后直接打开任意项目的入口文件：

```bash
# macOS
open css-loading-animations/index.html
# Windows
start css-loading-animations/index.html
```

## 仓库结构

```
workbuddy-inspirations/
├── AGENTS.md                    # 仓库级规则（最高优先级）
├── MEMORY.md                    # 仓库级长期上下文与灵感索引
├── README.md                    # 本文件
├── css-loading-animations/      # 每个灵感目录结构相同：
├── city-itinerary-planner/      #   AGENTS.md   项目规则
├── resume-landing-page/         #   README.md   项目说明
├── colorharbor-palette/         #   MEMORY.md   项目长期上下文
├── hangzhou-3day-nature-map-guide/
├── netmusic-listening-portrait/
├── ganfan-blindbox-workbench/
├── old-photo-restoration/
└── vesper-ai-landing/           # 例外：多文件结构（规格要求），入口仍为 index.html
```

## 仓库约定

| 约定 | 说明 |
| --- | --- |
| 一灵感一文件夹 | 不同灵感互不依赖，不合并、不混放 |
| 三件套必填 | 每个灵感目录必须包含 `AGENTS.md`、`README.md`、`MEMORY.md` |
| 命名规范 | 目录用全小写 kebab-case 英文；文档三件套固定大写 |
| 技术默认值 | 后端 JDK 1.8；前端原生 JS + jQuery（该灵感明确改用其它方案时除外） |
| 提交纪律 | 不提交 `node_modules/`、构建产物、密钥与 `.env`、本地缓存 |

完整规则见 [AGENTS.md](./AGENTS.md)。

## 新增一个灵感

1. 在根目录创建 kebab-case 英文文件夹
2. 按模板写 `AGENTS.md` / `README.md` / `MEMORY.md`
3. 在 `README.md` 里先讲清「这是什么灵感」，再写代码
4. 回到根 `MEMORY.md` 的「灵感索引」表追加一行

## 已知限制

- **地图类项目**（`city-itinerary-planner`、`hangzhou-3day-nature-map-guide`）的源码中保留 `__WB_HTTP_PORT__` / `__WB_TMAP_SECRET__` 占位符，地图密钥由 WorkBuddy 运行时通过本地代理注入。脱离该环境直接打开时页面可渲染，但底图与路线不会加载——这是刻意的安全设计，仓库中不含任何明文 Key。
- **`ganfan-blindbox-workbench`** 的数据存放在资料库在线数据表，脱离运行时打开会提示「数据表连接失败」。
- **`netmusic-listening-portrait`** 是构建期预渲染的静态快照，页面本身不发起任何网络请求，因此不会随听歌记录实时更新。
- **`resume-landing-page`** 中的联系方式为占位数据（`example.com` / `138-0000-0000`），使用时请替换为真实信息。
- **`vesper-ai-landing`** 是仓库中唯一按规格采用多文件结构的灵感；背景视频、点阵字体与 Font Awesome 图标均来自 CDN，离线打开时视频黑屏、标题回退本地兜底字体（仍可读）。

## 说明

本仓库内容为个人实践与学习产物，欢迎参考思路，不保证适用于生产环境。
