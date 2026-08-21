import Image from "next/image";
import type { LifeImage } from "@/content/life";

type Props = {
  images: LifeImage[];
  note: string;
};

export function EquipmentCard({ images, note }: Props) {
  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(15rem,0.75fr)] lg:items-stretch">
      {images.length > 0 ? (
        <div className="grid min-w-0 grid-cols-2 gap-3 overflow-hidden rounded-2xl">
          {images.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 1024px) 50vw, 360px"
              className={[
                "h-full min-h-40 w-full rounded-xl object-cover",
                images.length === 1 || index === 0 ? "col-span-2" : "",
              ].join(" ")}
            />
          ))}
        </div>
      ) : (
        <div className="life-equipment-placeholder min-h-52 rounded-2xl" aria-hidden>
          <span>BIKE / GEAR</span>
        </div>
      )}
      <div className="flex flex-col justify-between rounded-2xl border border-cyan-200/13 bg-white/[0.025] p-5 sm:p-6">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-cyan-200/65">EQUIPMENT FILE</p>
          <h3 className="mt-3 text-xl font-medium">车子与装备</h3>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{note}</p>
        </div>
        <p className="mt-8 text-xs text-[var(--text-muted)]">
          内容状态：已收录 {images.length} 张车子档案
        </p>
      </div>
    </div>
  );
}
