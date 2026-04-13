/**
 * 将仓库根目录 `supersplat/dist` 同步到 `web/public/supersplat-editor`，
 * 并写入适配 Next 静态路径的 index.html（与 3DGS_Study 中 iframe + ?load= 方案一致）。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const distDir = path.join(webRoot, "..", "supersplat", "dist");
const outDir = path.join(webRoot, "public", "supersplat-editor");

const indexHtml = `<!DOCTYPE html>
<html>
    <head>
        <title>SuperSplat</title>
        <meta charset="utf-8" />
        <base href="/supersplat-editor/">
        <link rel="manifest" href="./manifest.json">
        <link rel="stylesheet" href="./index.css">
        <style>
            /* 嵌入模式：弱化编辑 UI（参考 3DGS_Study），小窗适配 */
            #tools-container,
            #top-container,
            #menu,
            #menu-bar,
            #scene-panel,
            #view-panel,
            #color-panel,
            #bottom-toolbar,
            #mode-toggle,
            #timeline-panel,
            #data-panel,
            .ui-panel,
            .ui-menu,
            #app-label,
            #cursor-label,
            #shortcuts-popup {
                display: none !important;
            }
            /* 右上角坐标轴 / 视角方块缩小 */
            #view-cube-container {
                transform: scale(0.45) !important;
                transform-origin: top right !important;
            }
            /* 右侧工具栏：仅保留「显示/隐藏」点云按钮 */
            #right-toolbar-mode-toggle,
            #right-toolbar-frame-selection,
            #right-toolbar-camera-origin,
            #right-toolbar-color-panel,
            #right-toolbar-options,
            #right-toolbar > .right-toolbar-separator {
                display: none !important;
            }
            #right-toolbar {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                top: auto !important;
                bottom: 6px !important;
                right: 6px !important;
                transform: none !important;
                width: fit-content !important;
                min-width: 0 !important;
                max-width: none !important;
                padding: 0 !important;
                margin: 0 !important;
                border-radius: 3px !important;
                /* 盖住 index.css 里 54px 宽、8px 内边距的「大块黑底」 */
                background-color: rgba(18, 22, 26, 0.82) !important;
                box-shadow: none !important;
            }
            /* 图标 SVG 自带外圈留白/黑边：放大后裁切约各 10%（≈整体收一圈 1/5 视觉） */
            #right-toolbar-show-hide {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 28px !important;
                height: 28px !important;
                margin: 0 !important;
                border-radius: 2px !important;
                overflow: hidden !important;
            }
            #right-toolbar-show-hide svg {
                transform: scale(1.24) !important;
                transform-origin: center center !important;
                display: block !important;
            }
            #canvas-container {
                width: 100% !important;
                height: 100% !important;
                left: 0 !important;
                top: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .pcui-overlay {
                display: none !important;
            }
        </style>
        <link rel="shortcut icon" href="#">
        <meta name="description" content="SuperSplat" />
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />
        <script src="jszip.js"></script>
        <!-- 不在 Next 嵌入中注册 SW，避免缓存与作用域干扰 -->
    </head>
    <body>
        <script type="module" src="./index.js"></script>
    </body>
</html>
`;

function main() {
  if (!fs.existsSync(distDir)) {
    console.warn(
      `[sync-supersplat-editor] 未找到 ${distDir}，已跳过。请在 monorepo 根保留 supersplat 子项目后执行 npm run sync:supersplat-editor`,
    );
    process.exit(0);
  }
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(outDir), { recursive: true });
  fs.cpSync(distDir, outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), indexHtml, "utf8");
  console.log(`[sync-supersplat-editor] 已同步到 ${outDir}`);
}

main();
