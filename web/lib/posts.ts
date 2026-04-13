import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PostMeta = {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  /** 为 true 时不出现在首页、文章列表与搜索；仍可通过 /posts/<slug> 直接打开作参考 */
  hidden?: boolean;
};

const postsDir = path.join(process.cwd(), "content/posts");

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): { meta: PostMeta; body: string } | null {
  const full = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  return { meta: data as PostMeta, body: content };
}

export function getAllPosts(): { slug: string; meta: PostMeta }[] {
  return getPostSlugs()
    .map((slug) => {
      const p = getPostBySlug(slug);
      return p ? { slug, meta: p.meta } : null;
    })
    .filter((x): x is { slug: string; meta: PostMeta } => x !== null)
    .filter((x) => !x.meta.hidden);
}

/** 用于 generateStaticParams：仅预构建公开文章；hidden 仍可按 URL 动态访问（见 next 默认 dynamicParams） */
export function getPublicPostSlugs(): string[] {
  return getPostSlugs().filter((slug) => {
    const p = getPostBySlug(slug);
    return p !== null && !p.meta.hidden;
  });
}

export function getAllPostsSorted(): { slug: string; meta: PostMeta }[] {
  return getAllPosts().sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));
}
