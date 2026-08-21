import Image from "next/image";
import type { LifeImage } from "@/content/life";

type Props = {
  images: LifeImage[];
};

export function CyclingGallery({ images }: Props) {
  if (images.length === 0) {
    return (
      <div className="life-empty-state">
        <span className="font-mono text-xs tracking-[0.16em] text-cyan-200/65">FRAME 00</span>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          沿途截图正在整理。照片到位后，这里会成为一条可以横向浏览的骑行胶片带。
        </p>
      </div>
    );
  }

  return (
    <div
      className="life-gallery grid gap-4 sm:grid-cols-2 md:flex md:overflow-x-auto md:pb-4"
      tabIndex={0}
      role="region"
      aria-label="骑行截图画廊"
    >
      {images.map((image) => (
        <figure
          key={image.src}
          className="min-w-0 overflow-hidden rounded-xl border border-cyan-200/14 bg-black/25 md:w-[min(72vw,34rem)] md:flex-none md:snap-start"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 544px"
            className="aspect-[16/10] h-auto w-full object-cover"
          />
          {image.caption ? (
            <figcaption className="px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
