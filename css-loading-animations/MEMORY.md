# MEMORY.md — CSS 加载动画合集

## 长期上下文

这是本仓库的第一个灵感项目，也是「一灵感 = 一文件夹」约定的参照样板。
形态：单文件 HTML，含 8 种纯 CSS Loading 动画 + 一键复制 CSS。

## 架构决策

- **决策**：整个页面放在单个 `index.html` 中，不拆分 CSS/JS。
  - 原因：灵感类项目追求"发一个文件就能看"，拆分会引入相对路径与部署假设，反而降低分享便利性。
  - 影响：文件会较长（约 1000 行）；当动画数量继续增加（>20）时需重新评估是否拆分。
- **决策**：配色与尺寸全部走 CSS 变量，卡片通过内联 `style` 注入 `--c` / `--c2` / `--glow` / `--accent`。
  - 原因：新增动画时无需改动样式表，只加一个 `<article>` 即可；主题换色只改 `:root`。
  - 影响：HTML 侧内联样式较多，属可接受的取舍。
- **决策**：不引入 jQuery。
  - 原因：全页仅需处理"复制到剪贴板"一个交互，引入 jQuery 属于典型的小问题换来一个大依赖。
  - 影响：与用户前端常用技术栈（JS + jQuery）不同，此处是有意偏离。

## 踩坑记录

- **现象**：本地双击打开（`file://`）时 `navigator.clipboard.writeText()` 抛错或静默失败。
  - 根因：Clipboard API 要求安全上下文（HTTPS / localhost），`file://` 不满足。
  - 解决：保留 `textarea + document.execCommand('copy')` 作为降级路径。**`execCommand` 虽已废弃，但不可删除**，否则本地打开时复制功能失效。
- **现象**：GitHub 上出现同名文件重复。
  - 根因：Windows 本地不区分文件名大小写，误写成 `Memory.md` 时本地不报错，推送到 Linux 侧后变成两个文件。
  - 解决：三件套统一全大写 `AGENTS.md` / `README.md` / `MEMORY.md`。

## 用户纠正 / 偏好

- 用户明确要求本仓库采用「一灵感一文件夹 + 三件套（AGENTS.md / README.md / MEMORY.md）」，见仓库根 `AGENTS.md`。

## 外部资源

_（暂无）_
