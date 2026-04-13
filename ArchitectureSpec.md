# 技术工程文档："Synthetic Eye" 架构设计与开发细则

## 1. 技术栈选型 (Tech Stack)

考虑到首屏加载性能、SEO 以及对复杂 3D/视频组件的支持，放弃 Flutter Web 和传统 SPA 框架，采用现代 SSR/SSG 架构。

* **核心框架：** Next.js (App Router) 或 Nuxt 3。推荐 **Next.js**，因其 React 生态在 WebGL/Three.js 集成上最为成熟。
* **样式方案：** Tailwind CSS。非常适合实现极客风的定制化配色方案（配置 `#00fcff` 变量）和毛玻璃效果 (Glassmorphism)。
* **内容管理 (CMS)：** MDX (Markdown + JSX)。允许在 Markdown 文章中直接写 React 组件（比如嵌入 `<SuperSplatViewer url="xxx.ply" />`）。
* **3D 渲染引擎：** `playcanvas/supersplat` 或基于 WebGL/Three.js 的高斯溅射加载器。
* **代码高亮：** Prism.js 或 Shiki（支持终端风格主题）。
* **部署托管：** Vercel 或 Cloudflare Pages（自动处理 CI/CD 和全球 CDN）。

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
* **[  ] Phase 5: 部署上线**
    * 绑定自定义域名，配置 HTTPS，上线 Vercel。