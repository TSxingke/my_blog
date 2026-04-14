"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PostSummary } from "@/lib/search-posts";
import { filterPostsByQuery } from "@/lib/search-posts";

const PREVIEW_LIMIT = 8;

type Props = {
  posts: PostSummary[];
};

export function HomePostSearch({ posts }: Props) {
  const [query, setQuery] = useState("");

  const hits = useMemo(
    () => filterPostsByQuery(posts, query).slice(0, PREVIEW_LIMIT),
    [posts, query],
  );

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;
  const listHref = `/posts?q=${encodeURIComponent(trimmed)}`;

  return (
    <div className="mt-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-cyan-300/44 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-cyan-300/70"
        placeholder="搜索文章…"
        aria-label="搜索文章"
        autoComplete="off"
      />
      {hasQuery ? (
        <div className="mt-2 rounded-lg border border-cyan-300/38 bg-black/35 p-2 text-xs">
          {hits.length === 0 ? (
            <p className="px-1 py-2 text-[var(--text-muted)]">无匹配文章</p>
          ) : (
            <ul className="max-h-52 space-y-1 overflow-y-auto">
              {hits.map(({ slug, meta }) => (
                <li key={slug}>
                  <Link
                    href={`/posts/${slug}`}
                    className="block truncate rounded-md px-2 py-1.5 text-[var(--text-main)] hover:bg-cyan-400/10"
                  >
                    {meta.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={listHref}
            className="mt-2 block border-t border-cyan-400/26 pt-2 text-center font-mono text-cyan-200/90 hover:text-cyan-100 hover:underline"
          >
            在文章列表中查看全部结果 →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
