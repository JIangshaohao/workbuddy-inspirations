# MEMORY.md — ColorHarbor 配色收藏库

## 长期上下文

- 单文件纯前端站点，无构建、无依赖，双击 `index.html` 即跑。任何改动都要维持「单文件可分发」这条底线。
- 设计基调固定为**暗色画廊**：`#0D0D0D` 底 / `#1A1A1A` 卡片 / `#64FFDA` 强调 / `#F5F5F5` 主字 / 极细白边。Inter 做标题、Geist Mono 做色值。
- 配色数据共 30 组，5 个类别（极简 / 渐变 / 复古 / 霓虹 / 自然）各 6 组。类别标签用中文，配色名保留英文（当作画廊里的作品名）。

## 架构决策

- **决策**：单文件，不拆分 CSS / JS / 数据。
  - 原因：灵感类项目要「一个文件丢给别人就能打开」；无共享依赖，拆分的收益为零。
  - 影响：文件较长（约 1500 行），靠分区注释维持可读性。
- **决策**：配色数据以 `PALETTES` 数组为唯一数据源，类别由 `CATEGORIES` 驱动，数量运行时统计。
  - 原因：把「内容」与「呈现」解耦，加一组配色只改一处；避免标签数量与真实数据不同步。
  - 影响：所有卡片 / 详情 / 抽屉均动态渲染，HTML 里不出现任何色块。
- **决策**：Masonry 用 CSS `columns` 而非绝对定位或 JS 布局。
  - 原因：零 JS 布局成本，天然响应式。
  - 影响：列内顺序是「先竖后横」，不适用于需要严格阅读顺序的场景；本项目是画廊，可接受。
- **决策**：卡片高度由 id 哈希预计算并缓存到 `p.h`，而非每次渲染随机。
  - 原因：随机高度每次渲染都变，过滤切换时会「跳」，观感很乱。
  - 影响：错落感依然在，但稳定、可预期。
- **决策**：详情态用固定 `overlay` + `visibility`/`opacity` 双属性切换。
  - 原因：只切 `opacity: 0` 时隐藏元素仍可被 Tab 聚焦，键盘用户会「焦点跑到看不见的地方」。
  - 影响：切 `visibility` 会打断过渡，因此两者同设过渡时长。
- **决策**：入场动画用 `animation-fill-mode: backwards`。
  - 原因：`both` 会把结束帧的 `transform: none` 永久钉住，直接压制 `.color-block:hover` 的 `scale()`。
  - 影响：动画结束后 `transform` 交还给组件自身规则，hover 放大正常。

## 踩坑记录

- **现象**：详情态截图里「Card Component」标题几乎看不见。
  - 根因：预览组件直接用了 `palette.colors[2]`，而 `Ocean Deep` 的第 3 色是 `#03045E`（近黑），叠在 `rgba(13,13,13,.5)` 卡片上等于隐形。
  - 解决：新增 `readable(hex, floor=0.44)`，把过暗色按比例向白提亮（色相基本保持），用于所有「文字 / 描边 / 评分星 / glow」用途；色块本体（大色板、列表圆点）保持真实色值不加处理。
- **现象**：`grad-01`（Sunset Gold）详情里评分星是红色，一度以为是 `--star` 没传递。
  - 根因：误判。`Sunset Gold` 的 `colors[4]` 就是 `#B22222`（红），计算样式确认为 `rgb(178,34,34)`，逻辑本来就是对的。
  - 教训：怀疑变量传递时，用 `getComputedStyle` 打点确认，别靠肉眼看缩略图。
- **现象**：无头 Chrome 截图时详情态内容半透明 / 缺元素，但 `--dump-dom` 显示 DOM 完整且叠加层已是 `open`。
  - 根因：CSS 过渡在 headless 的 `--virtual-time-budget` 下不一定推进到终态，截图抓在了动画中途。
  - 解决：验证终态前先注入脚本把 `transition/opacity/transform` 冻结，或加 `--force-prefers-reduced-motion`。
- **现象**：Windows 下 `python -c` 里写 `/tmp/x.js`，随后 Git Bash 的 `/tmp` 找不到该文件。
  - 根因：Python 把 `/tmp` 解析到当前盘符根（`E:\tmp`），与 Git Bash 映射的 `C:\Users\...\Temp` 不是同一处。
  - 解决：脚本里一律用 `r'C:\Users\...\AppData\Local\Temp\...'` 显式绝对路径。

## 用户纠正 / 偏好

- 明确要求：**分类过滤标签与「随机发现」按钮同处一行**（顶部工具条），而**收藏夹抽屉入口在右侧**页头。
- 明确要求：**收藏爱心在色块右下角**（不是常见的右上角）。
- 明确要求：详情态**左侧放大展示配色 + 主色 hex + 复制按钮 + 五色色值列表**，**右侧 UI 预览（按钮 / 卡片 / 输入框 / 评分）**。
- 参考文件：`https://static.workbuddy.cn/workbuddy/playbook/cases/code-colorharbor-palette/output.html`（作为审美与交互基线，非逐字照搬；本项目在其基础上补齐了上述布局要求、扩到 30 组配色、加了对比度护栏与键盘导航）。

## 外部资源

- 参考实现（审美基线）：`https://static.workbuddy.cn/workbuddy/playbook/cases/code-colorharbor-palette/output.html`
- 字体：Inter、Geist Mono（Google Fonts，在线加载 + 系统字体栈回退）
