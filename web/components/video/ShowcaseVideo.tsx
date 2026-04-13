"use client";

import { useRef } from "react";

type Props = {
  src: string;
  className?: string;
  /** 悬停时自动播放（松手暂停并回到开头） */
  hoverToPlay?: boolean;
};

/**
 * 展示用视频：`object-contain` 完整显示画面（适合 1280×704 或 3072×1152 等比例，避免裁切）。
 */
export function ShowcaseVideo({
  src,
  className = "",
  hoverToPlay = true,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={ref}
      className={`mx-auto block h-auto max-h-full w-auto max-w-full object-contain ${className}`}
      src={src}
      muted
      playsInline
      loop
      controls={!hoverToPlay}
      preload="metadata"
      onMouseEnter={() => {
        if (!hoverToPlay || !ref.current) return;
        void ref.current.play().catch(() => {});
      }}
      onMouseLeave={() => {
        if (!hoverToPlay || !ref.current) return;
        ref.current.pause();
        ref.current.currentTime = 0;
      }}
    />
  );
}
