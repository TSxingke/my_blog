import Link from "next/link";
import { getAllPostsSorted } from "@/lib/posts";
import { filterPostsByQuery } from "@/lib/search-posts";

export const metadata = {
  title: "文章 | Synthetic Eye",
  description: "全部技术文章列表",
};

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function PostsIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const rawQ = sp.q;
  const q = Array.isArray(rawQ) ? rawQ[0] ?? "" : rawQ ?? "";
  const allPosts = getAllPostsSorted();
  const posts = filterPostsByQuery(allPosts, q);

  return (
    <div>
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-cyan-300/90 hover:text-cyan-200 hover:underline"
      >
        ← 返回首页
      </Link>
      <p className="neon-title mb-2 text-xs">文章</p>
      <h1 className="mb-8 text-2xl font-semibold">全部文章</h1>
      {q.trim() ? (
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          关键词「<span className="text-cyan-200/90">{q.trim()}</span>」：共{" "}
          {posts.length} 篇
          <Link
            href="/posts"
            className="ml-3 text-cyan-300/90 underline-offset-2 hover:underline"
          >
            清除筛选
          </Link>
        </p>
      ) : null}
      <ul className="space-y-4">
        {posts.map(({ slug, meta }) => (
          <li key={slug}>
            <Link
              href={`/posts/${slug}`}
              className="block rounded-xl border border-cyan-400/20 bg-black/25 p-4 transition hover:border-cyan-400/50"
            >
              <span className="text-lg font-medium text-[var(--text-main)]">{meta.title}</span>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
                <time dateTime={meta.date}>{meta.date}</time>
                {meta.tags?.map((t) => (
                  <span key={t} className="font-mono text-cyan-200/90">
                    #{t}
                  </span>
                ))}
              </div>
              {meta.description ? (
                <p className="mt-2 text-sm text-[var(--text-muted)]">{meta.description}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          {q.trim()
            ? "没有匹配的文章，可尝试其它关键词或清除筛选。"
            : "暂无文章，请在 content/posts 下添加 .mdx。"}
        </p>
      ) : null}
    </div>
  );
}
