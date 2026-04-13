import type { PostMeta } from "@/lib/posts";

export type PostSummary = { slug: string; meta: PostMeta };

export function matchesPostQuery(post: PostSummary, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const { slug, meta } = post;
  if (slug.toLowerCase().includes(q)) return true;
  if (meta.title.toLowerCase().includes(q)) return true;
  if (meta.description?.toLowerCase().includes(q)) return true;
  if (
    meta.tags?.some(
      (t) =>
        t.toLowerCase().includes(q) ||
        q.includes(t.toLowerCase().replace(/^#/, "")),
    )
  ) {
    return true;
  }
  return false;
}

export function filterPostsByQuery(
  posts: PostSummary[],
  raw: string,
): PostSummary[] {
  const q = raw.trim();
  if (!q) return posts;
  return posts.filter((p) => matchesPostQuery(p, q));
}
