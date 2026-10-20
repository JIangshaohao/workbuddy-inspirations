# AGENTS.md — netmusic-listening-portrait

## 项目简介

网易云音乐「个人听歌画像」单文件 HTML 报告：调用本地开源接口读取账号真实数据，
静态预渲染成一份深色沉浸风格的音乐杂志式长页报告。

## 技术栈

- 产物：**单个 `index.html`**（CSS / JS / 图片全部内联，零外链、零依赖）
- 数据获取：Node.js + [`NeteaseCloudMusicApi`](https://www.npmjs.com/package/NeteaseCloudMusicApi)（v4.32.0）
- 构建脚本：Node.js（服务端预渲染字符串 → 写文件）
- 图片压缩：Python + Pillow

## 目录结构

```
netmusic-listening-portrait/
├── index.html          # 唯一交付物（可直接双击打开 / 手机扫码看）
├── AGENTS.md
├── README.md
└── MEMORY.md
```

> 数据管线的脚本与中间产物**不放在本文件夹**，位于工作区临时目录
> `.workbuddy/tmp/netease-api/`（含 `fetch_data.js` / `analyze.js` / `build.js` 与 `data/`、`assets/`）。
> 该目录含登录凭证（`cookie.json`），**不得提交到 Git**。

## 运行 / 构建方式

```bash
# 0. 前置：Node 22+，Chrome（仅用于本地截图验证）

# 1. 安装接口依赖
cd .workbuddy/tmp/netease-api
npm install NeteaseCloudMusicApi@4.32.0

# 2. 扫码登录（生成二维码，用网易云 App 扫）
node qr_login.js          # 成功后在 cookie.json 写入登录态

# 3. 拉取数据
node fetch_data.js        # -> data/raw.json
node refetch_playlists.js # -> data/playlists.json（带 subscribed 标记）

# 4. 分析 + 构建
node analyze.js           # -> data/summary.json
node build.js             # -> netmusic-listening-portrait/index.html
```

## 编码约定

- 所有文案、注释、文档用**中文**；变量名、文件名用**英文**。
- 单文件 HTML：**严禁**运行时 `fetch` 数据或 JS 注入内容，所有数值必须在构建期写入 HTML 字符串。
- 图表一律用**构建期生成的内联 SVG**，不引入图表库。
- 颜色令牌集中在 `:root`，主色 `--ice:#9cc4e4`、强调色 `--amber:#e0a458`。

## 注意事项

- **网易云不开放逐月/逐日历史**：只有「全部时间听歌排行」与「最近一周听歌排行」（各 Top 100，含 `playCount`）。
  「偏好变化」只能靠这两者的对比来表达；任何「逐月趋势」都是编造。
- **歌手榜必须按主要艺人（`ar[0]`）归并**。否则同一张专辑的弦乐演奏者（如 Max Richter 专辑里的
  Louisa Fuller / Natalia Bonner / John Metcalfe…）会各占一个名额，污染榜单。
- **`user_playlist` 返回的 `specialType: 0` 同时包含自建与订阅**，必须用 `subscribed` 字段区分，
  否则「自建歌单数」会算错。
- 图片必须 base64 内联；Hero 图先裁掉右下角的水印再压缩（JPEG q76 约 73KB）。
