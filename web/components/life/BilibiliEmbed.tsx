"use client";

import Image from "next/image";
import { useState } from "react";
import type { BilibiliVideo } from "@/content/life";

type Props = {
  videos: BilibiliVideo[];
};

const BVID_PATTERN = /^BV[0-9A-Za-z]{10}$/;

function buildPlayerUrl(video: BilibiliVideo): string | null {
  if (!BVID_PATTERN.test(video.bvid)) return null;

  const page = Number.isInteger(video.page) && (video.page ?? 0) > 0 ? video.page : 1;
  const params = new URLSearchParams({
    bvid: video.bvid,
    page: String(page),
    high_quality: "1",
    danmaku: "0",
    autoplay: "0",
  });

  return `https://player.bilibili.com/player.html?${params.toString()}`;
}

export function BilibiliEmbed({ videos }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activated, setActivated] = useState(false);
  const video = videos[selectedIndex];
  const playerUrl = buildPlayerUrl(video);

  function selectVideo(index: number) {
    setSelectedIndex(index);
    setActivated(false);
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-cyan-200/15 bg-black/35 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <div className="relative aspect-video overflow-hidden bg-[#05090f]">
          {activated && playerUrl ? (
            <iframe
              src={playerUrl}
              title={video.title}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <>
              <Image
                src={video.cover.src}
                alt={video.cover.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={() => setActivated(true)}
                disabled={!playerUrl}
                className="life-focus life-interactive absolute inset-x-6 bottom-6 mx-auto flex w-fit items-center gap-3 rounded-full border border-cyan-200/35 bg-[#07131c]/90 px-5 py-3 text-sm font-medium text-cyan-50 backdrop-blur-md hover:-translate-y-0.5 hover:border-cyan-100/65 hover:bg-cyan-950 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span aria-hidden>▶</span>
                观看骑行片段
              </button>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-cyan-200/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[var(--text-main)]">{video.title}</p>
          <a
            href={video.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="life-focus shrink-0 rounded text-cyan-200/80 underline-offset-4 hover:text-cyan-100 hover:underline"
          >
            在 B 站打开 ↗
          </a>
        </div>
      </div>
      <div className="border-t border-cyan-200/10 p-3 lg:border-l lg:border-t-0">
        <p className="px-2 pb-2 font-mono text-[0.68rem] tracking-[0.16em] text-cyan-200/55">
          RIDE PLAYLIST / {String(videos.length).padStart(2, "0")}
        </p>
        <ol className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {videos.map((item, index) => (
            <li key={item.bvid}>
              <button
                type="button"
                aria-pressed={index === selectedIndex}
                onClick={() => selectVideo(index)}
                className="life-focus life-interactive group grid w-full grid-cols-[2rem_minmax(0,1fr)] items-start gap-2 rounded-xl border border-transparent px-2 py-2.5 text-left text-sm text-[var(--text-muted)] hover:border-cyan-200/15 hover:bg-cyan-300/[0.04] hover:text-cyan-50 aria-pressed:border-cyan-200/20 aria-pressed:bg-cyan-300/[0.07] aria-pressed:text-cyan-50"
              >
                <span className="font-mono text-xs text-cyan-200/45 group-aria-pressed:text-cyan-200/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-2 leading-5">{item.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
