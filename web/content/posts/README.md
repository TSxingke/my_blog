# 如何撰写与添加文章

文章源码位于本目录：**`web/content/posts/`**，每个文件一篇，扩展名 **`.mdx`**。

## 新建一篇

1. 在本目录新建文件，例如 **`my-first-post.mdx`**（文件名即 URL 中的 `slug`，会变成 `/posts/my-first-post`）。
2. 文件**开头**写 YAML 头信息（前后用 `---` 包裹），然后是 Markdown / MDX 正文。

### 常用 frontmatter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题 |
| `date` | 是 | 日期，建议 `"YYYY-MM-DD"` 字符串 |
| `description` | 否 | 摘要，用于列表与 SEO |
| `tags` | 否 | 标签数组，如 `[3DGS, 笔记]` |
| `hidden` | 否 | 为 **`true`** 时：不出现在**首页**、**文章列表**、**搜索**；仍可通过 **`/posts/<文件名>`** 直接打开，适合保留作参考样例 |

### 最小示例

```mdx
---
title: 我的第一篇笔记
date: "2026-04-12"
description: 一句话说明这篇文章写什么。
tags:
  - 笔记
---

正文从这里开始，支持 **Markdown**。

## 代码与公式

项目已接入代码高亮与 KaTeX，可直接使用 fenced code 与 `$...$` / `$$...$$`。

## 嵌入 3D 查看器（可选）

在 MDX 里可使用：

```mdx
<SuperSplatViewer url="/bike_splat.splat" />
```

`url` 或 `contentUrl` 指向 `public/` 下或同域可访问的 `.splat` 等路径（与 `lib/supersplat-editor.ts` 中默认模型配置一致）。

## 保存之后

- 本地开发：保存后一般 **热更新** 即可在首页与 `/posts` 看到；若未刷新可手动刷新浏览器。
- 当前示例文（`hello-mdx`、`gfm-table`、`phase4-media-perf`）已设 **`hidden: true`**，列表中不展示；需要对照语法时可浏览器打开对应 `/posts/...` 链接。

## 图片

正文里可用 Markdown 图片：`![说明](/your-image.png)`，图片放在 **`web/public/`** 下，路径以 **`/`** 开头引用。
