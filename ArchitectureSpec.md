# 技术工程文档："Synthetic Eye" 架构设计与开发细则

## 1. 技术栈选型 (Tech Stack)

考虑到首屏加载性能、SEO 以及对复杂 3D/视频组件的支持，放弃 Flutter Web 和传统 SPA 框架，采用现代 SSR/SSG 架构。以下选型以仓库当前实现为准，版本依据 `web/package.json`，构建与部署依据 `web/next.config.ts`、`web/Dockerfile` 和 `web/docker-compose.yml`。

* **核心框架：** **Next.js 16.2.3 App Router + React 19.2.4**。路由页面默认使用 Server Component，只在需要浏览器状态、事件或第三方播放器按需挂载时建立小范围 Client Component 边界。
* **样式方案：** **Tailwind CSS 4**，通过 `web/app/globals.css` 中的 `@import "tailwindcss"`、CSS Variables 与工具类实现主题；当前项目不依赖 `tailwind.config.js`。
* **内容管理 (CMS)：** MDX (Markdown + JSX)。允许在 Markdown 文章中直接写 React 组件（比如嵌入 `<SuperSplatViewer url="xxx.ply" />`）。
* **3D 渲染引擎：** `playcanvas/supersplat` 或基于 WebGL/Three.js 的高斯溅射加载器。
* **代码高亮：** Shiki（经 `rehype-pretty-code` 接入，见 `web/lib/compile-mdx.tsx`）。
* **部署托管：** Next.js `output: "standalone"` 产物配合 Docker Compose 部署；生活页保持静态可预渲染，不新增运行时服务或持久化依赖。

## 2. 关键技术细节与解决方案

### 2.1 霓虹青主题与样式实现
* **CSS Variables：** 在 `globals.css` 中定义全局主题色。
    ```css
    :root {
      --neon-cyan: #00fcff;
      --bg-dark: #0a0f14;
      --panel-bg: rgba(10, 15, 20, 0.7);
    }
    ```
* **发光边框 (Glow Effect)：** 使用 Tailwind 的自定义阴影。
    ```javascript
    // tailwind.config.js
    theme: {
      extend: {
        boxShadow: {
          'neon': '0 0 10px rgba(0, 252, 255, 0.5), inset 0 0 10px rgba(0, 252, 255, 0.2)',
        }
      }
    }
    ```

### 2.2 SuperSplat 与 3DGS 模型加载
* **性能瓶颈处理：** `.ply` 文件通常极大（百兆级别）。
* **解决方案：** 1.  模型存储在专用的对象存储（如 AWS S3, 阿里云 OSS）中，避免占用应用服务器带宽。
    2.  在 React 中使用 `React.lazy()` 和 `<Suspense>` 异步加载 3D 渲染器，防止阻塞主线程。
    3.  加载完成前展示高质量的骨架屏 (Skeleton) 或占位图 (Placeholder)。
* **当前实现（Next `web/`）：** 与历史项目 `3DGS_Study` 一致，iframe 嵌入 **完整 SuperSplat 编辑器**（`supersplat/dist` 经 `npm run sync:supersplat-editor` 同步到 `public/supersplat-editor/`），通过 **`index.html?load=<绝对或同域 URL>`** 自动导入 `.splat` 等。**默认模型路径**在代码中为 **`DEFAULT_SUPERPLAT_MODEL`**（当前 `/bike_splat.splat`），可用 **`NEXT_PUBLIC_SUPERPLAT_LOAD`**（兼容 `NEXT_PUBLIC_SPLAT_CONTENT`）覆盖。另保留轻量 **`@playcanvas/supersplat-viewer`** 于 `public/supersplat-viewer/`。生产环境可为 `.splat` 配置 MIME（见 `web/next.config.ts` headers，及参考 `3DGS_Study/nginx`）。

### 2.3 媒体悬停播放 (Hover to Play)
* 为了防止首页同时播放多个视频导致浏览器卡顿，使用原生的 `video` 标签配合 JS 事件监听。
    ```javascript
    // 简易组件逻辑
    const handleMouseEnter = () => videoRef.current.play();
    const handleMouseLeave = () => {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // 可选：重置进度
    };
    ```

### 2.4 Markdown 与代码块增强
* 使用 `remark-gfm` 处理标准 Markdown 语法。
* 使用 `rehype-pretty-code` 提供极客风格的代码高亮，并支持代码行号显示和文件名提示（如 UI 图中的终端样式）。
* 文章路径：`web/content/posts/*.mdx`；frontmatter 中 **`hidden: true`** 时不出现在首页/列表/搜索，仍可通过 `/posts/<slug>` 打开；作者说明见同目录 **`README.md`**。

### 2.5 首页 Hero 背景动态粒子 (`HeroDataFlowBackground`)

* **入口与范围：** 客户端组件 `web/components/hero/HeroDataFlowBackground.tsx`，在 `web/app/page.tsx` 中包裹首页主体；**仅首页**挂载，文章列表/详情等路由不加载该画布逻辑。
* **双 Canvas 分层（固定 `fixed inset-0`，`pointer-events-none`）**
  1. **网格 + 连线层：** `z-[6]`，整层透明度 `GRID_LAYER_OPACITY`（当前 `0.1`）。绘制中性网格与粒子连线（连线距离阈值 `LINK_DIST = 150`）。
  2. **粒子层：** `z-[28]`，整层 `PARTICLE_LAYER_OPACITY`（当前 `0.2`）。单层实心圆点（白 `#eef3fb` / 灰 `#9aa6b8` / 青 `#00fcff`），避免多层光晕。
  3. **主内容：** 同容器内 `z-[32]`，保证毛玻璃卡片与文字始终在最上。
* **粒子数量与初始化**
  * `PARTICLE_COUNT = 400`；`ringAngle` 按粒子序号均分 `2π` 并加微小抖动，供聚拢成环使用。
  * 位置：`biasedPosition` — 60% 全屏均匀；40% 一半在左下、一半在右上各 `0.3×宽 × 0.3×高` 矩形内均匀。
* **物理与周期（聚拢 → 就绪 → 爆开 → 散开）**
  * **聚拢：** 弹簧将粒子拉向 `(cx + R·cos(θ+spin), cy + R·sin(…))`，`R ≈ 0.24·min(w,h)`；`spin` 由 `gatherMs / GATHER_CURVE_MS`（`5600ms` 归一）驱动；中心半径内弱外向推，助成「近圆环」。
  * **爆开判定：** `gatherMs` 累加；`gatherMs ≥ MIN_GATHER_MS`（`2200`）且（**就绪度** ≥ `RING_READY_FRAC` `0.66` **或** `gatherMs ≥ MAX_GATHER_MS` `11000`）时施加径向冲量（约 `7.2~13` 速度量级）并切到散开相。
  * **就绪度：** 与当前 `ringSpin` 下环上目标点距离小于 `min(w,h)*0.048` 的粒子占比。
  * **散开：** `scatterMs` 累加，达 `CYCLE_SCATTER_MS`（当前 `12800ms`）后回到聚拢；散开阶段 **drag / steer / wander** 按 `scatterU` 曲线弱化阻尼、减轻向 `MOVE_SPEED` 随机漂移的纠偏，便于铺满全屏。
  * **鼠标排斥：** `repulseBoost` 由鼠标位移驱动并衰减，静止时衰减至近零，避免持续向心排斥导致粒子贴边。
  * **数值安全：** 空间网格分桶前对坐标 `Number.isFinite` 与索引边界检查；积分后对 `NaN` 回退到屏内安全点。
* **连线性能：** `drawLinksSpatial` 以 `GRID_CELL = 80` 分桶，仅检查相邻格，避免 `O(n²)`（`n=400`）。
* **首屏离开暂停：** 文档流内 `100dvh` 高的哨兵 + `IntersectionObserver`；离开视口则取消 `requestAnimationFrame`，回到视口再启动。
* **无障碍：** `prefers-reduced-motion: reduce` 时仅渲染静态低对比 CSS 网格层，不跑双 Canvas 动画循环。
* **全局底纹：** `web/app/globals.css` 中 `body` 背景网格已偏中性灰，与画布网格分工，避免满屏青蓝抢戏。

### 2.6 生活分栏架构 (`/life`)

本节落实 `PRD.md` §3.5 与 §4。首版是一个独立、静态内容为主的展示页，不进入 `web/content/posts/*.mdx` 文章索引，不引入 CMS、数据库、地图 SDK、轮播库或新的动效依赖。

#### 2.6.1 路由、渲染边界与站点导航

* **公开路由：** 新增 `web/app/life/page.tsx`，对应 `/life`。页面保持 Server Component，直接导入本地结构化内容并输出骑行、羽毛球、纸牌收藏和阅读四个语义章节；导出静态 `Metadata`，标题建议为 `生活 / Beyond the Screen | Synthetic Eye`。
* **页面外壳：** 新增 Server Component `web/app/life/layout.tsx`，使用普通 `div` 外壳并复用 `SiteIcpFooter`。背景直接继承 `web/app/globals.css` 的全局静态深色网格，不包裹 `HeroDataFlowBackground`：后者即使设置 `particles={false}` 仍会运行网格 Canvas 帧循环和鼠标视差，不符合生活页“克制且无满屏持续动效”的边界。主体宽度使用 `max-w-[1280px]`，与 PRD 的 `1200–1280px` 边界一致。
* **导航接入：** 将 `web/app/page.tsx` 与 `web/components/article/PostReadingNav.tsx` 中现有 `{ label: "生活", href: "#" }` 更新为 `/life`。实现阶段宜把重复的静态导航项收敛到 `web/lib/site-navigation.ts`，由首页侧栏和文章阅读导航共同引用，避免后续链接再次漂移；两种导航的布局结构仍各自保留，不为本功能做无关重构。
* **客户端边界：** `page.tsx` 不使用 `"use client"`。只有需要点击后创建 iframe 的 `BilibiliEmbed` 使用 Client Component；未来若增加画廊翻页按钮，也应作为独立小组件嵌入，而不是将整页转为客户端渲染。

建议文件结构：

```text
web/
├── app/life/
│   ├── layout.tsx
│   └── page.tsx
├── components/life/
│   ├── BilibiliEmbed.tsx
│   ├── CyclingGallery.tsx
│   ├── EquipmentCard.tsx
│   ├── PlayingCardGrid.tsx
│   └── ReadingArchive.tsx
├── content/life.ts
├── lib/site-navigation.ts
└── public/life/
    ├── cycling/
    ├── badminton/
    ├── cards/
    └── reading/
```

组件拆分按行为和重复边界进行：纯展示组件默认保持 Server Component；没有独立行为且只使用一次的羽毛球过渡卡可直接留在 `page.tsx`，不强制为每个视觉块建文件。

#### 2.6.2 内容模型与素材约定

`web/content/life.ts` 同时定义类型与首版内容常量，使素材缺失能由类型和渲染分支显式处理。它只保存可序列化数据，不导入 React 组件。建议最小模型如下：

```ts
type LifeImage = {
  src: `/life/${string}`;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

type BilibiliVideo = {
  bvid: string;
  page?: number;
  title: string;
  cover: LifeImage;
  originalUrl: `https://www.bilibili.com/${string}`;
};

type PlayingCard = {
  id: string;
  name: string;
  image: LifeImage;
  note?: string;
};

type BookEntry = {
  id: string;
  title: string;
  author: string;
  cover?: LifeImage;
  review: string;
  tags: string[];
  status: "read" | "reading" | "planned";
};

type LifeContent = {
  hero: LifeImage;
  cycling: {
    intro: string;
    video?: BilibiliVideo;
    gallery: LifeImage[];
    equipment: LifeImage[];
    equipmentNote?: string;
  };
  badminton: { text: string; image?: LifeImage };
  cards: PlayingCard[];
  reading: { status: "preparing" } | { status: "ready"; books: BookEntry[] };
};
```

* 路径统一使用 `/life/...` 的站点根路径；文件名使用小写 ASCII 与连字符，例如 `cycling/ride-01.webp`、`cards/bicycle-rider-back.webp`，不把展示顺序编码为业务 ID。
* `alt` 描述画面中与叙事有关的内容；纯装饰图使用空字符串。`caption` 不重复 `alt`，只补充路线、时间或个人记忆。
* 图片原始像素尺寸记录在数据中，供 `next/image` 预留纵横比，避免 CLS。提交素材前去除不需要的 EXIF 定位信息；不在仓库中保存未经筛选的原始相册。
* 首版内容是低频、人工维护的数据，使用 TypeScript 比 MDX 或 JSON 更容易在构建时发现缺字段。完整书单未来到位后可把 `BookEntry` 独立到 `web/content/books.ts`，但首版不预建空系统。

#### 2.6.3 B 站点击后懒加载

`web/components/life/BilibiliEmbed.tsx` 接收 `BilibiliVideo` 的可序列化字段，内部状态初始为 `activated = false`：

1. 初始只渲染本地封面 `next/image`、视频标题和原生 `<button type="button">观看骑行片段</button>`，HTML 中不得出现 B 站 iframe。
2. 用户点击按钮后才根据已校验的 `bvid` 与 `page` 组装 `https://player.bilibili.com/player.html?...&autoplay=0`，并将 iframe 插入同一固定宽高比容器。不得接受内容文件提供的任意 iframe URL。
3. iframe 设置可辨识的 `title`、`loading="lazy"`、`allow="fullscreen; picture-in-picture"` 与 `allowFullScreen`；页面始终保留指向 `originalUrl` 的“在 B 站打开”链接，作为跨域播放器被拦截时的回退。
4. 封面与 iframe 共用 `aspect-video` 容器，切换时不改变布局高度；播放器不自动播放、不自动发声。首版只允许同时存在一个播放器实例。
5. 因封面存放在 `web/public/life/cycling/`，无需为 B 站图片域名扩展 `next.config.ts` 的 `images.remotePatterns`，也不会在用户点击前连接 B 站第三方域名。

#### 2.6.4 图片优化与布局策略

* **主视觉：** 使用 `next/image` 的 `fill` + `sizes="100vw"` 与 `object-cover`，父容器设 `position: relative` 和固定的 `60–70svh`/合理最小高度。首屏仅此图使用 `preload`；其余图片保持默认懒加载。
* **响应式图片：** 画廊、装备和纸牌图片必须提供准确的 `sizes`，例如纸牌网格可用 `(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw`，避免浏览器按 `100vw` 下载过大资源。原始素材优先转换为 WebP 或 AVIF，同时保留足以覆盖最大渲染尺寸的分辨率。
* **骑行画廊：** 桌面端使用 `overflow-x-auto` + CSS `scroll-snap` 的胶片带，滚动区域可获得键盘焦点并有可见 `focus-visible` 轮廓；移动端在 `md` 以下切换为单列或双列网格，页面本身不得横向溢出。必要信息直接显示在图注中，不藏在 Hover 层。
* **装备档案：** 使用 1 张主图加 1–3 张辅图的 CSS Grid；只有一张图时自动扩展主图，不保留空格子，不生成商城式规格表。
* **纸牌收藏：** 桌面端使用响应式 Grid 表达收藏柜/轻微错位陈列，移动端固定双列。每张卡片的名称始终可见，`note` 可在大屏补充但不得成为只能 Hover 才能访问的信息。

#### 2.6.5 局部主题、动效与可访问性

* **主题作用域：** 在生活页根节点定义较弱的面板变量（如 `--life-panel-border`、`--life-panel-glow`）；纸牌章节使用 `data-life-tone="warm"` 覆盖为暗红/琥珀色。覆盖只作用于该章节，不修改 `:root` 的 `--neon-cyan`，阅读区自然回到冷灰与青色。
* **视觉强度：** 新增 `.life-panel`，沿用 `.glass-panel` 的背景、模糊和圆角，但边框 alpha 与阴影约为首页 `.glass-panel` 的 50–60%。暖色用于边缘高光、章节标识和局部径向渐变，不作为整页背景。
* **动效实现：** 只使用 CSS `transition`，持续时间限定在 `160–240ms`；纸牌 Hover 最多 `translateY(-4px)`。链接和按钮用 `:focus-visible` 提供同等或更清晰的反馈；触屏下不依赖 Hover。
* **减少动效：** 在 `web/app/globals.css` 的 `@media (prefers-reduced-motion: reduce)` 中将生活页过渡时长归零并移除 transform/渐显位移。页面本身不使用自动轮播、强视差或满屏粒子，因此无需额外动画状态机。
* **语义与键盘：** 页面使用一个 `h1`，四个内容区使用带 `aria-labelledby` 的 `<section>` 与顺序合理的 `h2`；视频触发器必须是按钮，不用可点击 `div`。所有外链可键盘触达，交互控件有可见焦点，装饰图 `alt=""`，信息图提供准确替代文本。

#### 2.6.6 缺失素材与错误降级

渲染逻辑不得用空播放器、大面积骨架屏或虚构内容填补缺口：

* 骑行视频缺失时，不渲染播放器容器，只显示“视频整理中”短说明；有 `originalUrl` 但播放器不可用时仍保留外链。
* 骑行画廊少于 6 张时按实际数量渲染，不复制图片凑数；数组为空时显示尺寸克制的文字状态。
* 装备照片数量不足时让已有图片扩展，不保留虚线空卡。
* 羽毛球没有图片时使用 PRD 指定的纯文字卡，“持续在打，但很少记录”是正式内容而非错误状态。
* 纸牌数组为空时显示“收藏档案整理中”；单项图片加载失败时保留名称和说明，不让网格整体坍塌。
* `reading.status === "preparing"` 时只显示真实的整理中入口；不得创建虚构 `BookEntry` 或整屏 Skeleton。

#### 2.6.7 实施顺序与验证

建议按以下小步实施，降低视觉返工与第三方嵌入风险：

1. 建立 `/life` Server Component、静态 metadata、共享导航数据和四段语义骨架。
2. 接入 `web/content/life.ts` 与 `web/public/life/` 素材，完成响应式图片和缺失素材分支。
3. 单独实现并验证 `BilibiliEmbed` 的点击后挂载，再加入纸牌暖色作用域与克制动效。
4. 运行 `web` 包完整 `npm run lint` 与 `npm run build`；若 lint 存在仓库既有错误，必须记录具体文件和规则，不用局部 lint 代替全量结果。
5. 在生产构建上验证 `/`、`/posts`、文章详情和新增 `/life` 均可访问，确认生活导航从首页与文章阅读导航均能到达。

首版验收矩阵：

| 维度 | 必验项目 |
|---|---|
| 内容顺序 | 桌面与移动端均为骑行 → 羽毛球 → 纸牌 → 阅读 |
| 第三方加载 | 初始 HTML/Network 无 B 站播放器请求；点击后才创建 iframe；不自动播放或发声 |
| 响应式 | `375px`、`768px`、`1280px` 视口无页面横向溢出，纸牌移动端双列，画廊内容可完整访问 |
| 图片 | 首屏主图尺寸稳定，其余图片懒加载，所有叙事图片有有效 `alt`，缺图分支不留空洞 |
| 键盘 | 可依次到达视频按钮、B 站外链、画廊滚动区与页面链接；焦点可见且无键盘陷阱 |
| 减少动效 | 模拟 `prefers-reduced-motion: reduce` 后无卡片位移、渐进动画、自动媒体或粒子画布 |
| 视觉作用域 | 暖色只出现在纸牌章节；离开该章节和进入其它路由后全站主题变量不受影响 |
| 回归 | 首页粒子、文章列表/详情、SuperSplat、站点备案 footer 与现有媒体展示行为不变 |

## 3. 当前进度与开发路线图 (Roadmap)

* **[ x ] Phase 1: 需求定义与 UI/UX 设计**
    * 完成视觉风格确认（极客风、霓虹青主题）。
    * 完成首页布局与卡片交互逻辑设计。
    * 完成 PRD 与技术选型文档。
* **[ x ] Phase 2: 基础设施搭建**
    * 初始化 Next.js / Nuxt 项目。
    * 配置 Tailwind CSS 主题变量及字体 (JetBrains Mono / Inter)。
    * 搭建基础 Layout（左右侧边栏响应式布局）。
* **[ x ] Phase 3: 核心组件开发**
    * 开发 MDX 解析与渲染流水线（`next-mdx-remote` + `remark-gfm` + `rehype-pretty-code` + `remark-math` / `rehype-katex`）。
    * 开发定制化 Markdown 渲染组件（代码块、引言、公式、嵌入查看器）。
    * SuperSplat：iframe 集成完整编辑器（`?load=`）；默认加载 `DEFAULT_SUPERPLAT_MODEL`；视频 `object-contain` + `public` 下示例 mp4。
    * 首页 Hero：`HeroDataFlowBackground` 双 Canvas 粒子背景（成环—爆开—散开循环、首屏离屏暂停、`prefers-reduced-motion` 降级）。
* **[ x ] Phase 4: 内容填充与性能优化**
    * 测试文章：`content/posts/phase4-media-perf.mdx`（内嵌 `![...](/avatar.jpg)` 验证 MDX 图片懒加载）。
    * MDX：`mdx-components` 中 `img` 统一 `loading="lazy"`、`decoding="async"`，正文大图建议写清宽高以降低 CLS。
    * 视频：首页 `ShowcaseVideo` 保持 `preload="metadata"` + 悬停播放；与 Phase 3 一致。
    * Lighthouse：对**生产构建**后的站点 URL 本地或 CI 执行 `npx lighthouse <url> --only-categories=performance` 查看 LCP/CLS；阈值与自动化门禁可按部署环境后续接入。
* **[ x ] Phase 5: Docker 部署上线**
    * 使用 `output: "standalone"`、`web/Dockerfile` 与 `web/docker-compose.yml` 部署现有站点。
* **[ x ] Phase 6: 生活分栏第一版页面骨架**
    * 已新增 `/life` 静态路由、四段内容骨架、共享导航入口与生活页 metadata。
    * 已完成类型化内容模型、B 站点击后加载组件、响应式图片组件、局部暖色主题、键盘可访问性与素材缺失降级。
    * 生产构建与 375/768/1280px 页面行为检查已通过；真实骑行、羽毛球、纸牌和阅读素材仍待提供后填充，填充后需再次执行同一验收矩阵再部署。
