"use client";

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "post-reading-theme";

export function ArticleReadingTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "light" || v === "dark") setTheme(v);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div
      className="post-reading-root relative"
      data-post-reading-theme={mounted ? theme : "dark"}
    >
      {children}
      <button
        type="button"
        onClick={toggle}
        className="post-reading-theme-btn fixed bottom-6 right-6 z-[100] rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition md:text-sm"
        aria-label={theme === "dark" ? "切换为浅色阅读" : "切换为深色阅读"}
      >
        {theme === "dark" ? "浅色阅读" : "深色阅读"}
      </button>
    </div>
  );
}
