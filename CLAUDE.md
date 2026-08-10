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

## 图片

- 一律 WebP + `<picture>` JPEG 兜底，用 `src/components/ResponsiveImage.jsx` 组件，不要直接写裸 `<img>`。
- 必须传 `width` / `height`（原始像素尺寸）—— 浏览器靠它预留空间，防 CLS。
- 首屏之外一律 `loading="lazy"`（组件默认行为，above-the-fold 才传 `eager`）。
- **单张 WebP 不超过 500KB。** UE5 截图从 PNG 转 WebP 通常能压到 1/40，不要直接扔原始 PNG 进 `public/`。

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

- `src/components/Hero.jsx` 有 23KB，过大，应该拆分。
- `body { overflow-x: hidden }` 是在盖住某处横向溢出，根因还没定位。
- **SPA 没有预渲染** —— 抓取器只能拿到 `index.html` 的 meta 标签，正文抓不到。Google 索引和社交平台分享卡片都受影响。待办：给 Vite 加预渲染插件，注意 `AxisCursor` 等依赖 `window` 的组件需要保护判断。
- `public/` 里的原始 PNG（`patrol-ai-debug.png`、`wave-spawner-runtime.png`）已被 WebP 取代，不再被代码引用，可以删除以缩小仓库体积。
