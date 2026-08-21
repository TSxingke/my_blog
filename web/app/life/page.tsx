import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BilibiliEmbed } from "@/components/life/BilibiliEmbed";
import { CyclingGallery } from "@/components/life/CyclingGallery";
import { EquipmentCard } from "@/components/life/EquipmentCard";
import { PlayingCardGrid } from "@/components/life/PlayingCardGrid";
import { ReadingArchive } from "@/components/life/ReadingArchive";
import { lifeContent } from "@/content/life";
import { siteNavigation } from "@/lib/site-navigation";

export const metadata: Metadata = {
  title: "生活 / Beyond the Screen | Synthetic Eye",
  description: "骑行、羽毛球、纸牌收藏与阅读——Synthetic Eye 技术博客之外的生活侧面。",
};

const activeNavigation = siteNavigation.filter((item) => item.href !== "#");

function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  description,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[6rem_minmax(0,1fr)]">
      <p className="font-mono text-xs tracking-[0.18em] text-cyan-200/55">{index}</p>
      <div>
        <p className="font-mono text-xs tracking-[0.18em] text-cyan-200/65">{eyebrow}</p>
        <h2
          id={id}
          className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-main)] sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function LifePage() {
  const { hero, cycling, badminton, cards, reading } = lifeContent;

  return (
    <div className="life-page-root min-w-0 overflow-hidden">
      <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="life-focus rounded-md font-mono text-sm font-semibold tracking-[0.12em] text-cyan-100"
        >
          SYNTHETIC EYE
        </Link>
        <nav aria-label="生活页站点导航">
          <ul className="flex items-center gap-1 text-sm sm:gap-2">
            {activeNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.href === "/life" ? "page" : undefined}
                  className="life-focus life-interactive block rounded-full border border-transparent px-3 py-2 text-[var(--text-muted)] hover:border-cyan-200/20 hover:text-cyan-100 aria-[current=page]:border-cyan-200/25 aria-[current=page]:bg-cyan-300/[0.06] aria-[current=page]:text-cyan-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-20 sm:px-6 lg:gap-8 lg:px-8">
        <section
          aria-labelledby="life-page-title"
          className="life-hero relative flex min-h-[34rem] max-h-[50rem] overflow-hidden rounded-[2rem] border border-cyan-100/16 bg-[#050a10] sm:min-h-[62svh]"
        >
          {hero.image ? (
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              preload
              className="object-contain object-top sm:object-cover sm:object-[50%_42%]"
            />
          ) : (
            <div className="life-hero-visual absolute inset-0" aria-hidden />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a10] via-[#06111a]/48 to-transparent" />
          <div className="relative mt-auto max-w-3xl p-6 sm:p-10 lg:p-14">
            <p className="font-mono text-xs tracking-[0.2em] text-cyan-200/70">{hero.eyebrow}</p>
            <h1
              id="life-page-title"
              className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              {hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{hero.summary}</p>
            <a
              href="#cycling-records"
              className="life-focus life-interactive mt-7 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/[0.07] px-5 py-3 text-sm font-medium text-cyan-50 hover:-translate-y-0.5 hover:border-cyan-100/55 hover:bg-cyan-300/[0.12]"
            >
              浏览骑行记录 ↓
            </a>
          </div>
        </section>

        <section
          id="cycling-records"
          aria-labelledby="cycling-heading"
          className="life-panel scroll-mt-6 rounded-[2rem] p-5 sm:p-8 lg:p-10"
        >
          <SectionHeading
            id="cycling-heading"
            index="01"
            eyebrow="CYCLING"
            title="先从路上开始"
            description={cycling.intro}
          />

          <div className="mt-8 md:ml-24">
            {cycling.videos.length > 0 ? (
              <BilibiliEmbed videos={cycling.videos} />
            ) : (
              <div className="life-video-placeholder aspect-video max-h-[34rem] w-full rounded-2xl">
                <div>
                  <p className="font-mono text-xs tracking-[0.18em] text-cyan-200/65">VIDEO 00</p>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">骑行视频整理中，播放器不会提前加载。</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 border-t border-cyan-100/10 pt-8 md:ml-24">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs tracking-[0.18em] text-cyan-200/60">RIDE FRAMES</p>
                <h3 className="mt-2 text-lg font-medium">沿途片段</h3>
              </div>
              <p className="hidden text-xs text-[var(--text-muted)] md:block">横向浏览 / Scroll</p>
            </div>
            <CyclingGallery images={cycling.gallery} />
          </div>

          <div className="mt-10 border-t border-cyan-100/10 pt-8 md:ml-24">
            <EquipmentCard images={cycling.equipment} note={cycling.equipmentNote} />
          </div>
        </section>

        <section
          aria-labelledby="badminton-heading"
          className="life-panel grid gap-6 rounded-[2rem] p-5 sm:p-8 md:grid-cols-[6rem_minmax(0,1fr)_auto] md:items-center lg:p-10"
        >
          <p className="font-mono text-xs tracking-[0.18em] text-cyan-200/55">02</p>
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-cyan-200/65">BADMINTON</p>
            <h2 id="badminton-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {badminton.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">{badminton.text}</p>
          </div>
          {badminton.image ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:aspect-[3/4] md:w-60">
              <Image
                src={badminton.image.src}
                alt={badminton.image.alt}
                fill
                sizes="(max-width: 767px) 100vw, 240px"
                className="object-cover object-[50%_58%] md:object-[50%_48%]"
              />
            </div>
          ) : (
            <div className="life-shuttle-mark" aria-hidden>
              <span />
            </div>
          )}
        </section>

        <section
          data-life-tone="warm"
          aria-labelledby="cards-heading"
          className="life-panel life-warm-section rounded-[2rem] p-5 sm:p-8 lg:p-10"
        >
          <SectionHeading
            id="cards-heading"
            index="03"
            eyebrow="MAGIC & PLAYING CARDS"
            title="下滑之后的一点惊喜"
            description={cards.intro}
          />
          <div className="mt-8 md:ml-24">
            <PlayingCardGrid cards={cards.items} />
          </div>
        </section>

        <section
          aria-labelledby="reading-heading"
          className="life-panel rounded-[2rem] p-5 sm:p-8 lg:p-10"
        >
          <SectionHeading
            id="reading-heading"
            index="04"
            eyebrow="READING"
            title="安静地收尾"
            description="读过的书、留下的一句话，以及以后仍想继续追踪的主题。"
          />
          <div className="mt-8 md:ml-24">
            <ReadingArchive reading={reading} />
          </div>
        </section>
      </main>
    </div>
  );
}
