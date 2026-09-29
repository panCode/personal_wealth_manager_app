import { Segmented } from "./ui";

export type PortfolioTab = "allocation" | "holdings" | "performance";

/** Shared header for the three Portfolio tabs. */
export function PortfolioHeader({ tab, big, bigNote, sub }: { tab: PortfolioTab; big: string; bigNote: React.ReactNode; sub: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[26px]">Portfolio</h1>
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-[32px]">{big}</span>
          <span className="text-[13px] font-bold text-accent">{bigNote}</span>
        </div>
        <span className="text-[12px] text-muted">{sub}</span>
      </div>
      <Segmented
        value={tab}
        options={[
          { value: "allocation", label: "Allocation", href: "/portfolio" },
          { value: "holdings", label: "Holdings", href: "/portfolio/holdings" },
          { value: "performance", label: "Performance", href: "/portfolio/performance" },
        ]}
      />
    </>
  );
}

/** Colour, label and pill tone for a holding's status. */
export function holdingPill(status?: string): { label: string; tone: "accent" | "attn" | "neutral" } | null {
  switch (status) {
    case "action":
      return { label: "Action", tone: "attn" };
    case "watching":
      return { label: "Watching", tone: "neutral" };
    case "on-track":
      return { label: "On track", tone: "accent" };
    case "lockin":
      return { label: "Switch in Mar", tone: "neutral" };
    default:
      return null;
  }
}
