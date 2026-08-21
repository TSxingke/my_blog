import Image from "next/image";
import type { LifeContent } from "@/content/life";

type Props = {
  reading: LifeContent["reading"];
};

export function ReadingArchive({ reading }: Props) {
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reading.books.map((book) => (
        <article
          key={book.id}
          className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 rounded-xl border border-cyan-200/13 bg-white/[0.025] p-4"
        >
          {book.cover ? (
            <Image
              src={book.cover.src}
              alt={book.cover.alt}
              width={book.cover.width}
              height={book.cover.height}
              sizes="80px"
              className="aspect-[2/3] h-auto w-20 rounded-md object-cover"
            />
          ) : (
            <div className="aspect-[2/3] w-20 rounded-md border border-cyan-200/15 bg-cyan-950/20" aria-hidden />
          )}
          <div className="min-w-0">
            <h3 className="font-medium">{book.title}</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{book.author}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{book.review}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <span key={tag} className="font-mono text-[0.68rem] text-cyan-200/70">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
