import type { ReactNode } from "react";
import { ArticleReadingTheme } from "@/components/article/ArticleReadingTheme";
import { PostReadingNav } from "@/components/article/PostReadingNav";

/**
 * 仅文章详情：中部阅读区、浅色/深色阅读模式切换（仅本路由）。
 */
export default function PostArticleLayout({ children }: { children: ReactNode }) {
  return (
    <ArticleReadingTheme>
      <div className="post-reading-shell relative mx-auto w-full max-w-[min(48.4rem,100%)]">
        <PostReadingNav />
        <div className="post-reading-surface rounded-2xl border border-cyan-400/30 bg-[rgba(7,12,20,0.9)] px-5 py-9 shadow-[0_12px_56px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(0,252,255,0.1)] backdrop-blur-md md:px-9 md:py-11">
          {children}
        </div>
      </div>
    </ArticleReadingTheme>
  );
}
