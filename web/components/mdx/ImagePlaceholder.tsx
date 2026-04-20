/**
 * MDX 用图像占位：正式发布前可替换为 <img /> 或其它组件。
 */
export function ImagePlaceholder({
  caption,
  idea,
}: {
  caption?: string;
  idea?: string;
}) {
  return (
    <figure className="my-6 rounded-lg border border-dashed border-cyan-400/45 bg-black/35 px-4 py-4 text-sm text-[var(--text-muted)]">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-cyan-300/70">
        图像占位
      </div>
      {caption ? (
        <figcaption className="mb-2 font-semibold text-[var(--text-main)]">{caption}</figcaption>
      ) : null}
      {idea ? <p className="m-0 leading-relaxed">{idea}</p> : null}
    </figure>
  );
}
