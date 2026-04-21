import "katex/dist/katex.min.css";
import { HeroDataFlowBackground } from "@/components/hero/HeroDataFlowBackground";

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeroDataFlowBackground particles={false}>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 text-[var(--text-main)] lg:px-6">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </div>
    </HeroDataFlowBackground>
  );
}
