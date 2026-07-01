"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/posts" },
  { label: "案例展示", href: "#" },
  { label: "生活", href: "#" },
  { label: "简历", href: "#" },
];

export function PostReadingNav() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="post-reading-nav fixed left-6 top-6 z-40 hidden xl:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "post-reading-nav-trigger flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-cyan-300/38 bg-black/34 shadow-[0_10px_28px_rgba(0,0,0,0.3),0_0_18px_rgba(0,252,255,0.12)] backdrop-blur-md transition hover:border-cyan-300/68 hover:bg-cyan-400/10",
          open ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
        aria-expanded={open}
        aria-controls="post-reading-nav-panel"
        aria-label="打开站点导航"
      >
        <Image
          src="/avatar.jpg"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
          priority={false}
        />
      </button>

      <div
        id="post-reading-nav-panel"
        className={[
          "mt-0 max-h-[calc(100vh-3rem)] w-72 overflow-y-auto rounded-2xl border border-cyan-400/28 bg-black/34 p-6 shadow-[0_14px_44px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(0,252,255,0.09)] backdrop-blur-md transition duration-200",
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-3 opacity-0",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-4 block rounded-full"
              aria-label="收起站点导航"
            >
              <Image
                src="/avatar.jpg"
                alt="头像"
                width={76}
                height={76}
                className="h-[4.75rem] w-[4.75rem] rounded-full border border-cyan-300/48 object-cover shadow-[0_0_18px_rgba(0,252,255,0.16)] transition hover:border-cyan-300/70"
              />
            </button>
            <Link href="/" className="group block">
              <p className="neon-title text-base font-semibold">Synthetic Eye</p>
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              科技世代更迭，文化亘古不变
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-cyan-300/28 px-2.5 py-1 text-sm text-cyan-100/80 transition hover:border-cyan-300/58 hover:bg-cyan-400/10 hover:text-cyan-50"
            aria-label="收起站点导航"
          >
            ×
          </button>
        </div>

        <p className="neon-title mt-7 text-xs">站点导航</p>
        <nav className="mt-3 space-y-1.5 text-base">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-lg border border-transparent px-3.5 py-2.5 text-[var(--text-main)]/90 transition hover:border-cyan-300/44 hover:bg-cyan-400/8 hover:text-cyan-100"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-7 border-t border-cyan-300/24 pt-5 font-mono text-sm text-[var(--text-muted)]">
          <Link
            href="/posts"
            className="mb-4 block transition hover:text-cyan-200"
            onClick={() => setOpen(false)}
          >
            ← 返回文章列表
          </Link>
          <a
            href="https://github.com/TSxingke"
            target="_blank"
            rel="noopener noreferrer"
            className="block transition hover:text-cyan-200"
          >
            GitHub
          </a>
          <a
            href="mailto:niushengke@outlook.com"
            className="mt-3 block break-all transition hover:text-cyan-200"
          >
            niushengke@outlook.com
          </a>
        </div>
      </div>
    </aside>
  );
}
