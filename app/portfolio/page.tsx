"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { PortfolioHeader, holdingPill } from "@/components/portfolio";
import { Card, Eyebrow, Pill, Row, RowText, Screen, SectionTitle } from "@/components/ui";
import { inr } from "@/lib/format";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

const pf = persona.portfolio;

/** 7 · Portfolio · Allocation tab */
export default function PortfolioAllocation() {
  const rebalance = useStore((s) => s.decisions["rebalance-1"]?.status ?? "proposed");
  const equityRow = pf.allocation[0];
  const equityPct = rebalance === "proposed" || rebalance === "declined" ? equityRow.pct : equityRow.target;

  return (
    <>
      <Screen>
        <div className="safe-top flex flex-col gap-4 px-5 pb-4">
          <PortfolioHeader tab="allocation" big={inr(pf.total)} bigNote={`XIRR ${pf.xirr3y}% · 3y`} sub={`Nifty 50 did ${pf.nifty3y}% over the same period.`} />

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Eyebrow>Where it sits vs plan</Eyebrow>
              <span className="text-[11px] text-muted">▎ = target</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {pf.allocation.map((a) => {
                const pct = a.key === "equity" ? equityPct : a.pct;
                const over = pct > a.target;
                return (
                  <div key={a.key} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-semibold">{a.label}</span>
                      <span className={over ? "font-bold text-attn-text" : "font-semibold text-muted"}>
                        {pct}%{over ? ` · ${pct - a.target} over` : ""}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-sunken">
                      <div className={`h-2.5 rounded-full ${over ? "bg-attn" : "bg-accent"}`} style={{ width: `${pct}%` }} />
                      <div className="absolute -top-[3px] h-4 w-0.5 bg-ink" style={{ left: `${a.target}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {rebalance !== "proposed" && rebalance !== "declined" && <span className="text-[12px] text-muted">Equity comes back to target once the switch settles on 1 Oct.</span>}
          </Card>

          <div className="flex flex-col gap-2.5">
            <SectionTitle>Funds that need a look</SectionTitle>
            <Card padded={false}>
              {pf.groups[0].holdings.map((h, i, arr) => {
                const pill = holdingPill(h.status);
                const href = h.decision ? `/decision/${h.decision}` : undefined;
                return (
                  <Row key={h.id} href={href} last={i === arr.length - 1}>
                    <RowText title={h.name} sub={`${inr(h.value)} · ${h.sub.split(" · ").slice(1).join(" · ")}`} />
                    {pill && <Pill tone={h.decision && rebalance !== "proposed" ? "accent" : pill.tone}>{h.decision && rebalance !== "proposed" ? (rebalance === "declined" ? "Declined" : "Placed") : pill.label}</Pill>}
                  </Row>
                );
              })}
            </Card>
            <Link href="/portfolio/holdings" className="flex h-11 items-center justify-center text-[13px] font-bold text-accent">See all 14 holdings</Link>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
