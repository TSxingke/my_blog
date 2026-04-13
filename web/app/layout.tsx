import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tsthinker.tech"),
  title: "Synthetic Eye | 合成之眼",
  description:
    "自动驾驶数据合成方向的个人技术博客：3D 高斯溅射、世界模型与工程实践。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
