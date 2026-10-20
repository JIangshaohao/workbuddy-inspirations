# AGENTS.md — 老照片修复工作台（old-photo-restoration）

## 项目简介
老照片修复工具。主产物是一个**零依赖单文件网页**（`index.html`），在浏览器内完成四步修复；另附一条 Python CLI 参考实现，用于批量处理与更强的去噪。

## 技术栈
- **主产物（页面）**：原生 HTML + CSS + JavaScript，**零依赖、零外链**，全部算法自实现（无 OpenCV.js、无 CDN）。
- **参考实现（CLI）**：Python 3.7+ / OpenCV / NumPy。
- **运行环境**：
  - 页面：任何现代浏览器，双击 `index.html` 即可（`file://` 下可用）。
  - CLI：WorkBuddy 隔离环境 `C:\Users\Soul\.workbuddy\binaries\python\envs\default`（依赖已装好，禁止污染系统全局环境）。
- **验收工具**：Node 22（用内置 `WebSocket` 直连 CDP）+ 无头 Chrome。无第三方依赖。

## 目录结构
```
old-photo-restoration/
├── AGENTS.md                 本文件
├── README.md                 面向读者的说明
├── MEMORY.md                 长期上下文（决策 / 踩坑 / 纠正）
├── index.html                ★ 主产物：单文件网页工作台
├── .gitignore                本灵感特有忽略项
├── scripts/
│   └── beautify.py           Python CLI 参考实现（批量处理路径）
├── tools/
│   ├── make_test_photo.py    生成仿真老照片（验收素材）
│   └── verify_page.js        index.html 的 CDP 端到端验收脚本
├── input/                    待修复原片（用户放置）
└── output/                   修复成品、对比图、指标报告
```

## 运行 / 构建方式
无构建步骤。

**页面**：直接双击 `index.html`，或浏览器打开 `file:///.../old-photo-restoration/index.html`。

**CLI 参考实现**：
```bash
PY="C:/Users/Soul/.workbuddy/binaries/python/envs/default/Scripts/python.exe"
"$PY" scripts/beautify.py input/old.jpg -o output/restored.png \
  --denoise medium --brightness 1.15 --contrast 1.2 --saturation 1.4 --sharpness 1.3 \
  --compare output/compare.png --report output/report.json
```

**验收（修改 index.html 后必跑）**：
```bash
NODE="C:/Users/Soul/.workbuddy/binaries/node/versions/22.22.2-6/node.exe"
PY="C:/Users/Soul/.workbuddy/binaries/python/envs/default/Scripts/python.exe"
"$PY" tools/make_test_photo.py <任意干净照片> tools/test-old.png 720
"$NODE" tools/verify_page.js
```

## 编码约定
- 语言：代码 / 变量名 / 文件名用**英文**；注释、文档、commit message 用**中文**。
- 页面必须保持**单文件、零依赖、零外链**。引入任何外部资源（CDN、字体、图片）都要先说明必要性。
- 修改处理管线后，必须同步：
  1. `index.html` 内的算法说明段落；
  2. `scripts/beautify.py` 的对应步骤（保持两条路径的**影调映射一致**，去噪算法允许不同）；
  3. 本文件与 `README.md` 的参数表；
  4. 跑一遍 `tools/verify_page.js`。
- 文件读写一律走 `np.fromfile` + `cv2.imdecode` / `cv2.imencode` + `tofile`（见 MEMORY.md 踩坑）。
- 输出统一 **PNG 无损**，不得用 JPG 交付。

## 注意事项
- **管线顺序不可调换**：先降噪再锐化，否则把噪点一起放大。
- **不要把整图 Laplacian 方差当作"清晰度提升"的证据**：胶片颗粒会大幅抬高该值，颗粒多的一方永远"赢"。它只能在相邻阶段间比较。
- **判断去噪是否过度，看「纹理保留」而不是主观感觉**：低于 70% 即为塑料感信号。
- 浏览器端处理 9 MP 图片约 11 秒（限边长后约 3 秒），大图会让页面短暂无响应，属预期。
- 变更 `flatMaskOf` 的直方图精度时务必回归——历史上 512 桶会导致掩膜为空（见 MEMORY.md）。
