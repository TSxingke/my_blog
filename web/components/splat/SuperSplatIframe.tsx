"use client";

import { useEffect, useState } from "react";
import { buildSuperplatEditorSrc, getDefaultSuperplatLoadPath } from "@/lib/supersplat-editor";

type Props = {
  /**
   * 自动导入的模型 URL。不传则使用环境变量或站点默认 `DEFAULT_SUPERPLAT_MODEL`；
   * 传 `null` 或 `""` 表示空场景（不加载）。
   */
  modelPath?: string | null;
  className?: string;
  title?: string;
};

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  if (typeof window === "undefined") return pathOrUrl;
  return new URL(pathOrUrl, window.location.origin).href;
}

function resolveModelPath(prop?: string | null): string | undefined {
  if (prop === null || prop === "") return undefined;
  if (prop !== undefined && prop.length > 0) return prop;
  return getDefaultSuperplatLoadPath();
}

/** 嵌入 `public/supersplat-editor` 中的完整 SuperSplat（`?load=` 与 3DGS_Study 一致）。 */
export function SuperSplatIframe({
  modelPath,
  className = "",
  title = "3DGS",
}: Props) {
  const [src, setSrc] = useState<string | null>(null);

  const resolved = resolveModelPath(modelPath);

  useEffect(() => {
    const loadUrl = resolved ? toAbsoluteUrl(resolved) : undefined;
    setSrc(buildSuperplatEditorSrc(loadUrl ?? null));
  }, [resolved]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {src ? (
        <iframe
          title={title}
          src={src}
          className={`min-h-0 flex-1 border-0 bg-black ${className}`}
          allow="camera; microphone; fullscreen; clipboard-read; clipboard-write; xr-spatial-tracking"
          loading="eager"
        />
      ) : (
        <div
          className={`flex flex-1 items-center justify-center bg-black/60 text-sm text-[var(--text-muted)] ${className}`}
        >
          正在加载…
        </div>
      )}
    </div>
  );
}
