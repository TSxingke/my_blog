import Image from "next/image";
import Link from "next/link";
import { HeroDataFlowBackground } from "@/components/hero/HeroDataFlowBackground";
import { HomePostSearch } from "@/components/search/HomePostSearch";
import { SuperSplatIframe } from "@/components/splat/SuperSplatIframe";
import { ShowcaseVideo } from "@/components/video/ShowcaseVideo";
import { SiteIcpFooter } from "@/components/layout/SiteIcpFooter";
import { getAllPostsSorted } from "@/lib/posts";

/** 放在 `public/` 下的多视角雨天演示视频（文件名以你本地为准）。 */
const SHOWCASE_VIDEO_SRC = "/multiview_rainy_small.mp4";

const navItems = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/posts" },
  { label: "案例展示", href: "#" },
  { label: "生活", href: "#" },
  { label: "简历", href: "#" },
];

const trendingTags = [
  "#3DGS",
  "#CARLA",
  "#ROS2",
  "#SLAM",
  "#DataSynthesis",
  "#世界模型",
];

export default function Home() {
  const allPosts = getAllPostsSorted();
  const posts = allPosts.slice(0, 6);

  return (
    <HeroDataFlowBackground>
      <>
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
          <aside className="glass-panel hidden w-72 shrink-0 rounded-2xl p-6 lg:flex lg:flex-col">
          <div className="mb-8">
            <Image
              src="/avatar.jpg"
              alt="头像"
              width={96}
              height={96}
              className="mb-4 h-24 w-24 rounded-full border-2 border-cyan-300/48 object-cover shadow-[0_0_20px_rgba(0,252,255,0.15)]"
              priority
            />
            <h1 className="neon-title text-2xl font-semibold">Synthetic Eye</h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              科技世代更迭，文化亘古不变
            </p>
          </div>
          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg border border-transparent px-3 py-2 text-[var(--text-main)] transition hover:border-cyan-300/62 hover:bg-cyan-400/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-cyan-300/32 pt-4 font-mono text-xs text-[var(--text-muted)]">
            <a
              href="https://github.com/TSxingke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-main)] transition hover:text-cyan-200"
            >
              GitHub
            </a>
            <a
              href="mailto:niushengke@outlook.com"
              className="break-all text-[var(--text-main)] transition hover:text-cyan-200"
            >
              niushengke@outlook.com
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-main)] transition hover:text-cyan-200"
            >
              LinkedIn
            </a>
          </div>
        </aside>
  
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
            <section className="glass-panel flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl p-6">
              <p className="neon-title mb-3 text-xs">精选展示</p>
              <div className="grid min-h-[17.5rem] flex-1 gap-4 lg:grid-cols-2">
                <div className="flex min-h-[14rem] flex-col overflow-hidden rounded-xl border border-cyan-300/52 bg-black/30 p-4 shadow-[0_0_22px_rgba(0,252,255,0.2)]">
                  <p className="font-mono text-sm tracking-wide text-[var(--text-main)]">3DGS</p>
                  <div className="mt-3 flex min-h-[14rem] flex-1 flex-col">
                    <SuperSplatIframe className="min-h-0 flex-1 rounded-lg" />
                  </div>
                </div>
                <div className="flex min-h-[14rem] flex-col overflow-hidden rounded-xl border border-cyan-300/52 bg-black/30 p-4 shadow-[0_0_22px_rgba(0,252,255,0.2)]">
                  <p className="font-mono text-sm tracking-wide text-[var(--text-main)]">Cosmos世界模型</p>
                  <div className="mt-3 flex min-h-[14rem] flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
                    <ShowcaseVideo src={SHOWCASE_VIDEO_SRC} />
                  </div>
                </div>
              </div>
            </section>
  
            <aside className="glass-panel flex w-full shrink-0 flex-col rounded-2xl p-6 lg:w-72">
              <p className="neon-title text-xs">搜索</p>
              <HomePostSearch posts={allPosts} />
              <p className="neon-title mt-5 text-xs">热门标签</p>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-cyan-200">
                {trendingTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-300/48 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </aside>
          </div>
  
          <section className="glass-panel rounded-2xl p-6">
            <p className="neon-title mb-3 text-xs">最新文章</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {posts.map(({ slug, meta }) => (
                <Link key={slug} href={`/posts/${slug}`} className="block">
                  <article className="h-full rounded-xl border border-cyan-300/38 bg-black/25 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/72">
                    <h2 className="font-semibold">{meta.title}</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{meta.date}</p>
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">
                      {meta.description ?? "阅读全文"}
                    </p>
                  </article>
                </Link>
              ))}
              {posts.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">暂无文章，请在 content/posts 下添加 .mdx。</p>
              ) : null}
            </div>
          </section>
        </main>
      </div>
      <SiteIcpFooter />
      </>
    </HeroDataFlowBackground>
  );
}
