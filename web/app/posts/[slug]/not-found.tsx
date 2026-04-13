import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold">未找到该文章</h1>
      <Link href="/posts" className="mt-4 inline-block text-cyan-300 hover:underline">
        返回文章列表
      </Link>
    </div>
  );
}
