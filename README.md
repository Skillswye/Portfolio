# Jason Zhao — Portfolio

电影感、暗黑氛围的个人作品集网站,使用 React + Vite 构建。

## 🎬 设计方向

- **风格**:Kojima 式电影氛围,暗夜色调 + 琥珀色强调
- **字体**:Cormorant Garamond(展示)+ JetBrains Mono(技术)+ Inter Tight(正文)
- **特色**:粒子背景、滚动渐入、电影章节式分隔、cinematic 角标

## 📁 项目结构

```
portfolio/
├── index.html              # 入口
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx           # React 启动
│   ├── App.jsx            # 主组件 + 项目数据(在这里改内容!)
│   ├── styles/
│   │   └── global.css     # 全局样式 + 颜色变量
│   └── components/
│       ├── Nav.jsx/css            # 导航
│       ├── Hero.jsx/css           # 首屏
│       ├── Philosophy.jsx/css     # 设计理念
│       ├── ProjectFeature.jsx/css # 项目深度展示模板(可复用)
│       ├── InDevelopment.jsx/css  # 预留区(下学期作品)
│       ├── About.jsx/css          # 关于
│       └── Footer.jsx/css         # 页脚
```

## 🛠️ 本地开发

```bash
# 1. 安装依赖(只需第一次)
npm install

# 2. 启动开发服务器(实时刷新)
npm run dev
# → 打开 http://localhost:5173

# 3. 构建生产版本
npm run build
# → 输出到 dist/ 文件夹

# 4. 预览生产版本
npm run preview
```

## ✏️ 如何修改内容

### 改项目内容
打开 `src/App.jsx`,找到 `featuredProjects` 数组。每个项目是一个对象,改 title / tagline / logline / systems 即可。

### 加新项目
在 `featuredProjects` 数组里 push 一个新对象,格式照抄现有的。

### 加入下学期 Niagara / System Design 作品
- **方案 A(推荐)**:把它们当作新的 featured project 加进 `featuredProjects`
- **方案 B**:更新 `InDevelopment.jsx` 里的 `slots` 数组,描述具体内容

### 替换占位媒体(截图/GIF)
1. 把图片/GIF 放进 `public/` 文件夹(比如 `public/runic-grid.gif`)
2. 在 `App.jsx` 的 `media` 数组里改 `type: 'placeholder'` 为 `type: 'image'`,加 `src: '/runic-grid.gif'`
3. 然后我们需要小改 `ProjectFeature.jsx` 让它渲染真实图片(告诉我什么时候要做这步)

### 改颜色 / 字体
打开 `src/styles/global.css`,所有颜色都在 `:root` 里的 CSS 变量,改一处全站生效。
- `--ember` = 琥珀色强调(改这个换主色调)
- `--void` / `--night` / `--shadow` = 背景深浅

### 改个人信息
- 名字、邮箱、GitHub:`src/components/About.jsx` 和 `Hero.jsx`
- 页面 title:`index.html`

---

## 🚀 部署上线(三种方案)

### 方案 A:Vercel(最推荐 ⭐)

**为什么**:对 React 完全零配置、推送代码自动重新部署、免费、可绑自定义域名。

**步骤**:
1. 把代码推到 GitHub 仓库
2. 去 [vercel.com](https://vercel.com) 用 GitHub 登录
3. 点 "Add New Project" → 选择你的仓库 → 直接 Deploy(默认配置就行)
4. 几秒后拿到一个 `xxx.vercel.app` 的网址
5. **以后每次更新**:`git push` 就自动更新网站

### 方案 B:Netlify

**步骤**:
1. `npm run build` 生成 `dist/` 文件夹
2. 去 [netlify.com](https://netlify.com) 注册
3. 把 `dist/` 文件夹拖到 Netlify 的部署区(就这么简单)
4. 拿到 `xxx.netlify.app` 网址
5. 也可以连接 GitHub 实现自动部署

### 方案 C:GitHub Pages

**步骤**:
1. 在 `vite.config.js` 改 `base: '/你的仓库名/'`(比如 `base: '/portfolio/'`)
2. 安装 gh-pages:`npm install --save-dev gh-pages`
3. 在 `package.json` 的 `scripts` 加一行:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
4. 运行 `npm run deploy`
5. 在 GitHub 仓库 Settings → Pages → 选 gh-pages 分支
6. 拿到 `你的用户名.github.io/portfolio` 网址

---

## 🎨 自定义域名(可选)

如果你想要 `jasonzhao.com` 之类的域名:
1. 在 Namecheap / Google Domains / Cloudflare 买域名(约 $10/年)
2. Vercel/Netlify 里加自定义域名,跟着指引设置 DNS
3. 自动配 HTTPS,完成

---

## 📝 接下来的 TODO

预留好的位置,你可以慢慢填:

- [ ] 替换 `src/components/About.jsx` 里的 `[your-email]` 和 GitHub 链接
- [ ] 替换三个项目的占位 logline 和 systems(Project 02、03 现在是占位的)
- [ ] 上传项目截图/GIF 到 `public/`,替换占位
- [ ] 下学期 Niagara 课结束后,把成品加入 `InDevelopment` 或作为新 Project
- [ ] System Design 课程作业同上
- [ ] 部署到 Vercel/Netlify
- [ ] (可选)买自定义域名

---

## 💡 设计哲学(供你以后维护时参考)

这个网站避免了几个"作品集陷阱":
- 不用 Inter/Roboto 这种烂大街字体
- 不用紫色渐变 + 白底
- 不用浮夸的滑动卡片
- 不用"全屏视频背景但加载特别慢"

取而代之的是:克制的电影感、有节奏的章节划分、给每个项目足够的呼吸空间。

招生官和招聘方看作品集的时间通常不超过 90 秒——这个网站的所有设计决策都在为"前 90 秒"服务。
