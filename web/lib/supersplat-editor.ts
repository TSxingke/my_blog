/**
 * 嵌入完整 SuperSplat 编辑器（与 `supersplat/src/main.ts` 中 `?load=` 行为一致，参考 3DGS_Study）。
 * 无 `load` 参数时启动空场景；默认模型路径见 `DEFAULT_SUPERPLAT_MODEL`。
 */
export const SUPERPLAT_EDITOR_PATH = "/supersplat-editor/index.html";

/** 默认自动加载的 `.splat`（放在 `public/` 下）；可用环境变量覆盖。 */
export const DEFAULT_SUPERPLAT_MODEL = "/bike_splat.splat";

/**
 * 默认 `?load=` 路径：优先 `NEXT_PUBLIC_SUPERPLAT_LOAD`，其次 `NEXT_PUBLIC_SPLAT_CONTENT`，
 * 否则为 `DEFAULT_SUPERPLAT_MODEL`。
 */
export function getDefaultSuperplatLoadPath(): string {
  const a = process.env.NEXT_PUBLIC_SUPERPLAT_LOAD?.trim();
  const b = process.env.NEXT_PUBLIC_SPLAT_CONTENT?.trim();
  if (a && a.length > 0) return a;
  if (b && b.length > 0) return b;
  return DEFAULT_SUPERPLAT_MODEL;
}

/** 相对默认焦点 (0, 0.5, 0) 的世界坐标偏移（见 `camera.ts` URL `focal`）。 */
const EMBED_FOCAL_Y_OFFSET = 2.1;
const EMBED_FOCAL_Z_OFFSET = 3.5;

/**
 * 构建编辑器 iframe URL（`camera.ts` 内读取 `focal` / `angles` / `distance`）。
 * - `angles=180,0`：与 `editor.ts` 中 `camera.align` 的 `nz` 一致，视线朝向 **−Z**。
 * - `focal`：在默认 (0, 0.5, 0) 基础上 **Y+10、Z+2**。
 */
export function buildSuperplatEditorSrc(loadAbsoluteUrl?: string | null): string {
  const q = new URLSearchParams();
  if (loadAbsoluteUrl) {
    q.set("load", loadAbsoluteUrl);
  }
  q.set("camera.overlay", "false");
  q.set("angles", "0,0");
  const focalY = 0.5 + EMBED_FOCAL_Y_OFFSET;
  const focalZ = EMBED_FOCAL_Z_OFFSET;
  q.set("focal", `0,${focalY},${focalZ}`);
  return `${SUPERPLAT_EDITOR_PATH}?${q.toString()}`;
}
