import Image from "next/image";
import type { PlayingCard } from "@/content/life";

type Props = {
  cards: PlayingCard[];
};

export function PlayingCardGrid({ cards }: Props) {
  if (cards.length === 0) {
    return (
      <div className="life-card-empty">
        <div className="life-card-back" aria-hidden />
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-amber-200/65">COLLECTION 00</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
            首批纸牌照片正在整理。这里不会放空的视频位，收藏到位后再逐副写下名字与喜欢它的理由。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {cards.map((card, index) => (
        <article key={card.id} className="life-playing-card life-interactive">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/45">
            <Image
              src={card.image.src}
              alt={card.image.alt}
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-contain"
            />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-[0.68rem] tracking-[0.14em] text-amber-200/45">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-sm font-medium text-amber-50 sm:text-base">{card.name}</h3>
          </div>
          {card.note ? (
            <p className="mt-2 text-xs leading-6 text-[var(--text-muted)] sm:text-sm">{card.note}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
