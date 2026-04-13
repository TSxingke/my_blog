import type { NextConfig } from "next";

/**
 * 开发时可设 `NEXT_DIST_DIR=.next-dev-alt`，使用独立目录与锁文件，
 * 避免与仍占用默认 `.next` 的另一 `next dev` 冲突（与端口无关）。
 */
const nextConfig: NextConfig = {
  /** Docker 多阶段构建复制 `.next/standalone` 所需 */
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async headers() {
    return [
      {
        source: "/:path*.splat",
        headers: [{ key: "Content-Type", value: "application/octet-stream" }],
      },
    ];
  },
};

export default nextConfig;
