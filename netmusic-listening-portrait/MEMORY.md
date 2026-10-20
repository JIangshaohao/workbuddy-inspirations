# MEMORY.md — netmusic-listening-portrait

## 长期上下文

- 服务对象：Harrison Jiang（网易云昵称 `Harrison-Jiang`，uid `1303540492`）。
- 报告数据：收藏 4,737 首、订阅 17 个歌单、自建 24 个歌单、账号注册于 2017-12-04。
- 唯一交付物是 `index.html`；数据管线脚本与凭证在工作区临时目录 `.workbuddy/tmp/netease-api/`。
- 报告核心叙事：**「囤得辽阔，听得专注；长期活在器乐里，最近开始往回听。」**

## 关键发现（写报告时的立论依据）

- 历史播放 Top100 **100% 来自他自己的收藏**——他不听推荐、不听别人的歌单，只吃自己囤的粮。
- 4,737 首收藏里只有 100 首进入历史高频回放（2.11%），比例 **47 : 1**。
- 全部时间 Top100 与最近一周 Top100 **零重叠**——长期偏好与近期状态完全换了一套。
- 长期：Ólafur Arnalds（6,813 次）、Marcin Przybyłowicz（巫师 3 OST）、Einaudi、Max Richter —— 全器乐。
- 近期：Gigi Perez、Michael Jackson、Backstreet Boys、Babyface、Tamia —— 千禧年 R&B / 有人声。
- 老歌转向可量化：本周 27% 的播放来自 2009 年以前，历史总榜仅 6%，**相差 4.6 倍**。
- 「囤而不听」名单：邓紫棋 32 首、薛之谦 30、陈奕迅 25、张学友 25、林俊杰 22、孙燕姿 18、李荣浩 18
  —— 收下了整个华语流行，却从未进入高频回放。
- 自建歌单命名极简（自 / 温 / 安 / 心 / 唱 / 阳 / 图），**订阅**歌单反而承担了曲风标签功能
  （新古典、北欧氛围、梦核、冰岛后摇、氛围感 chill）——「贴标签」这件事他外包给了别人。

## 架构决策

| 决策 | 原因 | 影响 |
| --- | --- | --- |
| 用开源 `NeteaseCloudMusicApi` 本地起服务，而非官方开放平台 | 官方平台需企业资质且不开放个人听歌历史 | 需在用户本机跑 Node 服务；凭证落在本地 |
| 走**扫码登录**而非让用户手抄 cookie | 体验更短、凭证不外传、二维码 5 分钟自动失效 | 需一次人工扫码动作 |
| 数据在 Node 侧预渲染成 HTML 字符串，页面运行时零数据依赖 | 满足「静态预渲染、不依赖 JS 注入」硬要求 | 改数据必须重跑构建，不能改 HTML |
| 图表手写内联 SVG，不引图表库 | 单文件、零依赖、体积可控 | 图表能力受限，复杂图表要自己写 |
| Hero 图用 AI 生成后**裁掉底部 8% 水印**再压缩 | 图片模型输出带「AI生成」角标 | 构图需预留底部裁切空间 |

## 踩坑记录

- **`user_playlist` 的 `specialType: 0` 混装自建与订阅歌单**
  现象：按 `specialType===0` 统计「自建歌单」得到 37 个，与 `user_subcount.createdPlaylistCount = 31` 不符。
  根因：该字段同时返回 `subscribed: true` 的歌单。
  解决：用 `subscribed` 字段区分。修正后自建 24 个、订阅 17 个。
  **教训**：`createdPlaylistCount` 与实际可见歌单数也不完全相等（可能含已删除项），一律以实际拉取结果为准。

- **歌手榜被「合作演奏者」污染**
  现象：Max Richter 之后紧跟着 Louisa Fuller / Natalia Bonner / John Metcalfe / Ian Burdge / Chris Worsey
  五个同值（各 771 次）的「歌手」。
  根因：`user_record` 返回的 `song.ar` 会把古典专辑的弦乐演奏者逐个列为艺人。
  解决：歌手榜统一按**主要艺人 `ar[0]`** 聚合，污染消失。

- **散点图被「热度」维度压扁**
  现象：所有播放歌曲的 `pop` 都集中在 85–100，纵轴几乎不起作用。
  解决：改为「收藏云 + 已播高亮」——4,220 首收藏铺满整图作背景，真正播放的点高亮其上，
  既救活了纵轴，也直接把「囤 vs 听」的矛盾可视化了。

- **收藏云用 `<path>` 密集小线段而非几千个 `<circle>`**
  4,220 个 `<circle>` 约 300KB，改用 `M{x} {y}h.1` 的 path（每点约 11 字符）后约 46KB。

- **无头 Chrome 截图必须用 CDP**
  现象：`--screenshot` 只截视口，`svh` 单位让 Hero 撑满整个超长窗口，正文截不到。
  解决：用 `Page.captureScreenshot` + `captureBeyondViewport:true`；
  调试时另注一份把 `.hero{min-height}` 压到 560px 并禁用 `.reveal` 的副本。

## 用户纠正 / 偏好

- 用户实际主力是**网易云音乐**，最初引用酷狗技能只是「给个参考」——不要默认按酷狗的数据口径设计。
- 用户明确要求：**数据不足的内容直接隐藏，不要编数字**。
- 用户要求图片/CSS/JS 全内联、静态预渲染、响应式、手机可看。

## 外部资源

- NeteaseCloudMusicApi：`npm install NeteaseCloudMusicApi`（v4.32.0，含 380 个接口）
- 关键接口：`login_qr_key` / `login_qr_create` / `login_qr_check`、`user_account`、`user_subcount`、
  `user_playlist`、`likelist`、`playlist_track_all`、`user_record`（`type=0` 全部时间 / `type=1` 最近一周）、
  `song_detail`（含 `publishTime`，可用于年代分析）
- 参考版式：WorkBuddy playbook 案例 `listening-portrait/output.html`
