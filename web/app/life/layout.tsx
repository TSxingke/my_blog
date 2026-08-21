import { SiteIcpFooter } from "@/components/layout/SiteIcpFooter";

export default function LifeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <div className="flex-1">{children}</div>
      <SiteIcpFooter />
    </div>
  );
}
