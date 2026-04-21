import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublicPostSlugs } from "@/lib/posts";
import { compilePostMdx } from "@/lib/compile-mdx";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublicPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "未找到文章" };
  return {
    title: `${post.meta.title} | Synthetic Eye`,
    description: post.meta.description ?? post.meta.title,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { content } = await compilePostMdx(post.body);

  return (
    <article className="post-reading-article">
      <Link
        href="/posts"
        className="post-reading-back mb-8 inline-block text-sm text-cyan-300/90 hover:text-cyan-200 hover:underline"
      >
        ← 返回文章列表
      </Link>
      <header className="post-reading-head mb-10 border-b border-cyan-400/28 pb-8">
        <p className="neon-title mb-2 text-xs">文章</p>
        <h1 className="post-reading-title text-3xl font-semibold tracking-tight text-[var(--text-main)]">
          {post.meta.title}
        </h1>
        <div className="post-reading-meta mt-3 flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
          <time dateTime={String(post.meta.date)}>{String(post.meta.date)}</time>
          {post.meta.tags?.map((t) => (
            <span key={t} className="post-reading-tag font-mono text-cyan-200/80">
              #{t}
            </span>
          ))}
        </div>
      </header>
      <div className="article-prose">{content}</div>
    </article>
  );
}
