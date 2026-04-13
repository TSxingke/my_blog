/**
 * 主页底部备案展示：底部中央标明备案号，备案号链至工信部备案查询系统。
 */
export function SiteIcpFooter() {
  return (
    <footer className="border-t border-cyan-400/15 bg-black/25 px-4 py-5 text-center text-xs text-[var(--text-muted)] backdrop-blur-sm">
      <p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 transition hover:text-cyan-200/90 hover:underline"
        >
          京ICP备2026000826号-1
        </a>
      </p>
    </footer>
  );
}
