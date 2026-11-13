# Jason Zhao — Portfolio

关卡与系统设计师个人作品集。内容重心是**设计意图和系统思维**，不是视觉炫技。

## 技术栈

React 18 · Vite 5 · react-router-dom 7 · framer-motion 13 → Vercel

```bash
npm run dev      # localhost:5173
npm run build    # → dist/
npm run preview  # 本地预览生产构建
```

路由在 `src/App.jsx`。项目内容的唯一数据源是 `src/data/projects.js` —— 加项目、改文案都在那里，不要把内容硬编码进组件。

## 设计方向（不要偏离）

电影感暗黑氛围，Kojima 式。核心是**克制**：大量留白、细线分隔、信息缓慢显露、等宽字体做技术标注。

不要：企业模板感、圆角卡片堆叠、亮色背景、渐变按钮、emoji 当图标（用 SVG）。
不要：横向滚动叙事 —— 移动端体验和无障碍成本都太高。

## 颜色

只用 `src/styles/global.css` 里的 CSS 变量，**禁止在组件里硬编码 hex**。

| 用途 | 变量 | 值 |
|---|---|---|
| 背景 | `--void` | `#08080a` |
| 卡片/浮层 | `--night` `--shadow` `--char` | |
| 边框/分隔线 | `--ash` `--mist` | |
| 次要文字 | `--bone` | `#8a8a92` |
| 正文 | `--pale` | `#c8c8cc` |
| 强调文字 | `--light` | `#e8e8ea` |
| 主强调色 | `--ember` | `#c9893f` |
| 强调高亮 | `--ember-bright` | `#e6a55a` |
| 冷色副强调 | `--signal` | `#4a7a9e` |

### 对比度红线

- **`--mist` (#4a4a55) 对底色只有 2.29:1 —— 禁止用作文字色。** 只能做边框、分隔线、滚动条。
- 次要文字一律用 `--bone`（5.84:1，过 AA）。
- `--signal` 只有 4.35:1，仅限大字号或 UI 描边，不要用于小字正文。
- 新增任何颜色前先验算对比度：正文 ≥ 4.5:1，大字/UI 组件 ≥ 3:1。

## 字体

- 展示标题 `--font-display` → Cormorant Garamond
- 正文 `--font-body` → Inter Tight
- 技术标注/eyebrow `--font-mono` → JetBrains Mono

三者已在 `index.html` 预连接并引入。**不要再加新字体** —— 每多一个都是一次阻塞渲染的网络请求。

## 动效

- hover / 状态反馈：150–300ms
- 滚动渐入：≤ 600ms（`.reveal` + IntersectionObserver，见各页面组件）
- **所有动效必须能被 `prefers-reduced-motion: reduce` 关掉**，global.css 底部已有全局兜底 block，新增动画时确认它能覆盖到。
- 自定义十字光标 `AxisCursor.jsx` 有三重降级：非精确指针、iframe 悬停、键盘导航时自动让位。改它的时候别破坏这三条。
  `prefers-reduced-motion` **不**关闭准星（它跟随用户的手 1:1 移动，不算动画），只把淡入淡出设为 0。
- 首页太阳系是 `src/components/hero/orrery.js`（纯 canvas 2D，`Hero.jsx` 只负责挂载）。动画以「60fps 帧」为单位、按 `dt` 推进 —— 新增任何运动量都要乘 `dt`，否则在高刷屏（Jason 的显示器是 319Hz）上会快好几倍。
  - 风格是**古典天文版画**：细线轨道、点刻（stipple）行星、规则放射线的太阳、弧线小行星带、等宽小标注。参考：Trouvelot 1881 天文版画、Eleanor Lutz《Atlas of Space》。
  - Jason 否掉过两样，不要加回来：**形状会变化的日冕**（看起来像一块被拉伸的不规则平面；太阳的光芒要保持规则的圆形）和**最外圈的罗马数字历法环**。不要改回发光渐变的写实行星。
  - **行星必须看得出自转**：每颗是固定在球面上的一组点，绕倾斜的自转轴转动（金星逆向），并画出穿过两极的轴线。表面纹理在 `SURFACE` 里按行星定义（木星条带 + 大红斑、地球陆地、火星极冠…），噪声复用 `planet/lib/noise.js`。
  - 颜色全部从 CSS 变量读取（琥珀 + 骨白双色，冷色只给地球），不要在里面写 hex。
  - `prefers-reduced-motion` **不**让太阳系静止：公转、尘埃、流星照常播放（Jason 自己的 Windows 关了动画效果，静止版被他当成了 bug）。只有入场「画出来」的动画和鼠标视差遵守这个设置。
  - Hero 滚出屏幕后停止渲染；canvas 按 DPR（上限 2）绘制，细线才清晰。
  - 彩蛋要保留：双击太阳（耀斑 + 加速 + 几秒后飞过一艘船）、双击行星（涟漪 + 推开尘埃）、流星。

## 图片

- 一律 WebP + `<picture>` JPEG 兜底，用 `src/components/ResponsiveImage.jsx` 组件，不要直接写裸 `<img>`。
- 必须传 `width` / `height`（原始像素尺寸）—— 浏览器靠它预留空间，防 CLS。
- 首屏之外一律 `loading="lazy"`（组件默认行为，above-the-fold 才传 `eager`）。
- **单张 WebP 不超过 500KB。** UE5 截图从 PNG 转 WebP 通常能压到 1/40，不要直接扔原始 PNG 进 `public/`。

## 视频

- 自托管在 `public/videos/`，用 `src/components/VideoPlayer.jsx`（原生 `<video>`，`preload="metadata"`），不再用 YouTube / Vimeo 嵌入 —— Vimeo 在 localhost 下报过 Player error，且第三方 iframe 没法精确跳转。
- 编码：H.264 MP4 + AAC，`-movflags +faststart`（否则要下完才能播 / 跳转），需要点击跳转的视频加 `-g 60`（2 秒一个关键帧）。
- **单个视频不超过 50MB**（GitHub 超 50MB 警告、超 100MB 拒收）。1080p 用 `-crf 23~24 -preset slow` 通常够。
- 每个视频配一张 `-poster.webp` 封面（从视频里截帧），路径和尺寸写在 `projects.js`。

## 3D 星球生成器（`src/components/planet/`）

UE5 星球生成器的网页复刻，是第三个项目 `/work/planet-generator`（`projects.js` 里 `showPlanetGenerator: true`）。海报 `public/planet-generator-poster-*` 是用这个网页版本身渲染的（seed 1337）。

- **没有昼夜面**：强环境光 + 跟随相机、往左上偏约 30° 的头灯（`scene/Sky.jsx`），Canvas 用 `flat`（不做 tone mapping），这样 UE 的 hex 颜色能原样显示。不要再加太阳光。
- **地貌颜色在所有设备上都是逐像素算的**（`lib/terrain.glsl.js`，注入 MeshStandardMaterial 的 `color_fragment`），所以放多大都不糊。顶点色插值无论网格多密，放大后都会糊，不要退回顶点色。这个 shader 很吃片元算力，所以手机（coarse pointer）的 DPR 封顶 1.5。
- 网格只负责起伏和轮廓：桌面端先算 64 段预览再细化到 256 段，手机端 128 段，见 `params.js` 的 `PASSES_*`。256 段在 Worker 里分块计算，滑条有新改动时旧任务会被中止。shader 的参数取自 `geometry.userData.params`（生成当前网格的那组参数），这样颜色不会跑在起伏前面。
- OBJ 导出单独构建 128 段（`EXPORT_SEGMENTS`，约 14MB）；导出 256 段的显示网格会有约 60MB。
- `projects.js` 里 `year` / `engine` / `role` 都可以省略，信息条会自动按项数排列（Planet Generator 没有 engine）。

- **`@react-three/fiber` 必须停在 v8、`drei` 停在 v9** —— fiber v9 要求 React 19。three 锁在 0.172（drei 9 发布时对应的版本）。
- three 只在懒加载 chunk 里：`ProjectFeature` 只能静态引入 `PlanetGeneratorSection.jsx`（不含 three），不要直接 import `PlanetGenerator.jsx`。
- `.reveal` 必须放在 Section 里（同步渲染部分），放进懒加载组件里 ProjectDetail 的 IntersectionObserver 看不到，会一直透明。
- **地形/配色公式有两份，改一处必须同步改另一处**：`lib/terrain.js`（Worker：起伏；配色部分只有 OBJ 导出用，显示用的构建传 `{ colors: false }` 跳过）和 `lib/terrain.glsl.js`（屏幕上的逐像素配色）。规则顺序也要一致。
- `lib/noise.glsl.js`（地表配色 + 云层）是 `lib/noise.js` 的逐位移植：改哈希常数或梯度表必须两边同步。
- gn 梯度是 12 条棱方向 × 1/√2（单位长度），σ≈0.19 —— UE 版的标准化常数（0.235 等）依赖这个，换梯度会让「海洋 60%」不再约等于 60% 面积。
- 3D 场景里的 hex 颜色集中在 `palette.js`（场景数据，不是 UI 色）；面板 UI 仍然只用 CSS 变量。
- 所有运动乘 `useFrame` 的 `dt`；`Motion` 开关在 `prefers-reduced-motion` 下默认关闭。
- three 自带的 OBJExporter 不给 Mesh 写顶点色，所以 `lib/exportPlanet.js` 是手写的 OBJ writer。

## 无障碍

- 焦点样式在 global.css 的 `:focus-visible`，用琥珀色描边。不要 `outline: none`。
- 跳转链接 `.skip-link` 是第一个 tab 停靠点，指向 `<main id="main">`。
- 所有 `<img>` 必须有描述性 `alt`，写清楚图里在展示什么系统 —— 这也是给招聘方看的信息。

## 已知问题 / TODO

- **film grain 噪点层是当前最大的性能瓶颈（已实测定位，暂时保留不动）。**
  `global.css` 里 `body::before` 是 `position: fixed` 全屏 + `mix-blend-mode: overlay`。
  混合模式强制浏览器每帧拿整页当背景重新合成。首页滚动实测（DPR 2）：

  | 状态 | 中位帧 | p95 | 掉帧率 |
  |---|---|---|---|
  | 现状 | 21.8ms (~46fps) | 41.5ms | 7% |
  | 关掉 `body::before` | 16.7ms (60fps) | 19.5ms | 1% |

  贵的是 `mix-blend-mode`，不是噪声纹理 —— 换成预渲染 PNG 平铺但保留 overlay，
  实测毫无改善（22.0ms）；去掉混合模式才回到 16.7ms。
  注意：在近黑背景上 overlay 几乎把颗粒抵消了，视觉收益极低。
  改这里之前先和 Jason 确认，这是他的视觉签名。

- `body { overflow-x: hidden }` 是在盖住某处横向溢出，根因还没定位。
- **SPA 没有预渲染** —— 抓取器只能拿到 `index.html` 的 meta 标签，正文抓不到。Google 索引和社交平台分享卡片都受影响。待办：给 Vite 加预渲染插件，注意 `AxisCursor` 等依赖 `window` 的组件需要保护判断。
- `public/` 里的原始 PNG（`patrol-ai-debug.png`、`wave-spawner-runtime.png`）已被 WebP 取代，不再被代码引用，可以删除以缩小仓库体积。
