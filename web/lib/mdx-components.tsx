import type { MDXComponents } from "mdx/types";
import { ImagePlaceholder } from "@/components/mdx/ImagePlaceholder";
import { SuperSplatIframe } from "@/components/splat/SuperSplatIframe";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mb-4 mt-10 text-3xl font-semibold tracking-tight text-[var(--text-main)] first:mt-0" {...props} />
  ),
  h2: (props) => (
    <h2 className="mb-3 mt-8 text-2xl font-semibold text-[var(--text-main)]" {...props} />
  ),
  h3: (props) => (
    <h3 className="mb-2 mt-6 text-xl font-semibold text-[var(--text-main)]" {...props} />
  ),
  p: (props) => <p className="mb-4 leading-relaxed text-[var(--text-main)]/95" {...props} />,
  a: (props) => (
    <a className="text-cyan-300 underline-offset-2 hover:underline" {...props} />
  ),
  ul: ({ className, ...rest }) => {
    const isTask = className?.includes("contains-task-list");
    return (
      <ul
        className={[
          "mb-4 space-y-1 text-[var(--text-main)]/95",
          isTask ? "list-none pl-0" : "list-disc pl-6",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    );
  },
  ol: (props) => <ol className="mb-4 list-decimal space-y-1 pl-6 text-[var(--text-main)]/95" {...props} />,
  li: ({ className, ...rest }) => (
    <li
      className={[
        "leading-relaxed",
        className?.includes("task-list-item") ? "[&>input]:mr-2 align-middle" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  ),
  table: ({ children, className, ...rest }) => (
    <div className="my-4 w-full overflow-x-auto rounded-lg border border-cyan-400/38 bg-black/30">
      <table
        className={[
          "w-full min-w-[280px] border-collapse text-left text-sm text-[var(--text-main)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </table>
    </div>
  ),
  thead: (props) => <thead {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: ({ className, ...rest }) => (
    <tr className={["even:bg-white/[0.04]", className].filter(Boolean).join(" ")} {...rest} />
  ),
  th: ({ className, ...rest }) => (
    <th
      className={[
        "border border-cyan-400/44 bg-cyan-950/45 px-3 py-2 text-left font-semibold text-cyan-50/95",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  ),
  td: ({ className, ...rest }) => (
    <td
      className={[
        "border border-cyan-400/32 px-3 py-2 align-top text-[var(--text-main)]/95",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mb-4 border-l-2 border-cyan-400/72 bg-cyan-400/5 py-2 pl-4 text-[var(--text-muted)]"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-cyan-400/32" />,
  img: ({ alt, className, ...rest }) => (
    <img
      className={["my-4 max-h-[min(70vh,720px)] w-auto max-w-full rounded-lg border border-cyan-400/32", className]
        .filter(Boolean)
        .join(" ")}
      decoding="async"
      {...rest}
      alt={alt ?? ""}
      loading="lazy"
    />
  ),
  code: (props) => {
    const inline = typeof props.className !== "string" || !props.className.includes("language-");
    if (inline) {
      return (
        <code
          className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-sm text-cyan-100"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: (props) => (
    <pre className="mb-4 overflow-x-auto rounded-lg border border-cyan-400/38 bg-black/50 p-4 text-sm shadow-[0_0_14px_rgba(0,252,255,0.12)]" {...props} />
  ),
  ImagePlaceholder: (props: { caption?: string; idea?: string }) => (
    <ImagePlaceholder caption={props.caption} idea={props.idea} />
  ),
  SuperSplatIframe: (props: { modelPath?: string | null }) => (
    <div className="my-6 overflow-hidden rounded-xl border border-cyan-400/44 shadow-[0_0_22px_rgba(0,252,255,0.16)]">
      <SuperSplatIframe modelPath={props.modelPath} className="aspect-video min-h-[280px]" />
    </div>
  ),
  /** PRD 命名：`url` / `contentUrl` 均作为模型路径传给 `?load=`（与 3DGS_Study 一致）。 */
  SuperSplatViewer: (props: { url?: string; contentUrl?: string | null }) => (
    <div className="my-6 overflow-hidden rounded-xl border border-cyan-400/44 shadow-[0_0_22px_rgba(0,252,255,0.16)]">
      <SuperSplatIframe
        modelPath={props.contentUrl ?? props.url}
        className="aspect-video min-h-[280px]"
      />
    </div>
  ),
};
