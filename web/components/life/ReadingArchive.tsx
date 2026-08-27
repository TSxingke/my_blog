"use client";

import { useState } from "react";
import type { LifeContent } from "@/content/life";

type Props = {
  reading: LifeContent["reading"];
};

export function ReadingArchive({ reading }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "notes">("all");

  if (reading.status === "preparing") {
    return (
      <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="life-book-spines" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-cyan-200/65">READING LOG</p>
          <h3 className="mt-3 text-xl font-medium">阅读档案整理中</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">{reading.note}</p>
        </div>
      </div>
    );
  }

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const noteCount = reading.books.filter((book) => book.note).length;
  const matchingBooks = reading.books
    .map((book, index) => ({ book, position: index + 1 }))
    .filter(({ book }) => {
      if (filter === "notes" && !book.note) return false;
      if (!normalizedQuery) return true;

      return `${book.title} ${book.note ?? ""}`.toLocaleLowerCase().includes(normalizedQuery);
    });

  return (
    <div>
      <div className="life-reading-overview grid gap-6 rounded-2xl p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <div className="life-book-spines" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-cyan-200/65">READING LOG</p>
          <h3 className="mt-3 text-xl font-medium">一份慢慢累积的已读书单</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
            不做评分榜，也不急着把每本书归类。有些只留下名字，有些还留下一句话。
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:w-fit">
          <div className="min-w-28 rounded-xl border border-cyan-200/12 bg-black/20 px-4 py-3">
            <dt className="font-mono text-[0.66rem] tracking-[0.14em] text-cyan-200/55">READ</dt>
            <dd className="mt-1 text-2xl font-semibold text-cyan-50">{reading.books.length}</dd>
          </div>
          <div className="min-w-28 rounded-xl border border-cyan-200/12 bg-black/20 px-4 py-3">
            <dt className="font-mono text-[0.66rem] tracking-[0.14em] text-cyan-200/55">NOTES</dt>
            <dd className="mt-1 text-2xl font-semibold text-cyan-50">{noteCount}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-b border-cyan-100/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="life-reading-search life-focus-within flex min-w-0 items-center gap-3 rounded-xl border border-cyan-200/14 bg-black/20 px-4 py-3 lg:w-[24rem]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 fill-none stroke-cyan-200/55"
          >
            <circle cx="11" cy="11" r="6.5" strokeWidth="1.75" />
            <path d="m16 16 4 4" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span className="sr-only">搜索已读书目</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索书名或一句话"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-main)] outline-none placeholder:text-slate-500"
          />
        </label>

        <div
          role="group"
          aria-label="书单筛选"
          className="flex w-fit rounded-xl border border-cyan-200/12 bg-black/20 p-1"
        >
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
            className="life-focus life-interactive rounded-lg px-3 py-2 font-mono text-xs text-[var(--text-muted)] hover:text-cyan-50 aria-pressed:bg-cyan-300/[0.09] aria-pressed:text-cyan-100"
          >
            全部 {reading.books.length}
          </button>
          <button
            type="button"
            aria-pressed={filter === "notes"}
            onClick={() => setFilter("notes")}
            className="life-focus life-interactive rounded-lg px-3 py-2 font-mono text-xs text-[var(--text-muted)] hover:text-cyan-50 aria-pressed:bg-cyan-300/[0.09] aria-pressed:text-cyan-100"
          >
            有随记 {noteCount}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-cyan-200/50">ARCHIVE INDEX</p>
        <p aria-live="polite" className="text-xs text-[var(--text-muted)]">
          显示 {matchingBooks.length} / {reading.books.length} 本
        </p>
      </div>

      {matchingBooks.length > 0 ? (
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {matchingBooks.map(({ book, position }) => (
            <li key={book.id} className="life-book-entry life-interactive min-w-0 rounded-xl p-4 sm:p-5">
              <article>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[0.68rem] tracking-[0.14em] text-cyan-200/45">
                    {String(position).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.62rem] tracking-[0.12em] text-slate-500">
                    {book.note ? "NOTE" : "ARCHIVED"}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-medium leading-7 text-[var(--text-main)]">《{book.title}》</h3>
                {book.note ? (
                  <p className="mt-3 border-l border-cyan-200/18 pl-3 text-sm leading-6 text-[var(--text-muted)]">
                    {book.note}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="life-empty-state mt-4 rounded-xl" role="status">
          <p className="text-sm leading-6 text-[var(--text-muted)]">没有找到匹配的书，换一个关键词试试。</p>
        </div>
      )}
    </div>
  );
}
