"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PortfolioHeader, holdingPill } from "@/components/portfolio";
import { Card, Chip, Pill, Row, RowText, Screen } from "@/components/ui";
import { inr } from "@/lib/format";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

const pf = persona.portfolio;
type View = "type" | "goal" | "attention";

const goalNames: Record<string, string> = { retire: "Retire well", home: "Bigger home", emergency: "Emergency fund", none: "Not assigned to a goal" };
const goalOrder = ["retire", "home", "emergency", "none"];

/** 7b · Portfolio · Holdings tab */
export default function PortfolioHoldings() {
  const [view, setView] = useState<View>("type");
  const rebalance = useStore((s) => s.decisions["rebalance-1"]?.status ?? "proposed");
  const all = pf.groups.flatMap((g) => g.holdings.map((h) => ({ ...h, group: g.label })));

  const sections =
    view === "type"
      ? pf.groups.map((g) => ({ key: g.key, label: `${g.label} · ${g.count}`, total: g.total, items: g.holdings, more: g.more }))
      : view === "goal"
        ? goalOrder.map((gl) => {
            const items = all.filter((h) => h.goal === gl);
            return { key: gl, label: `${goalNames[gl]} · ${items.length}`, total: items.reduce((s, h) => s + h.value, 0), items, more: undefined };
          }).filter((s) => s.items.length)
        : [{ key: "attn", label: "Needs attention · 2", total: all.filter((h) => h.status === "action" || h.status === "watching").reduce((s, h) => s + h.value, 0), items: all.filter((h) => h.status === "action" || h.status === "watching"), more: undefined }];

  return (
    <>
      <Screen>
        <div className="safe-top flex flex-col gap-3.5 px-5 pb-4">
          <PortfolioHeader tab="holdings" big={inr(pf.total)} bigNote="14 holdings · 5 sources" sub="Synced from MFCentral, NSDL, EPFO and your banks · today 6:00 AM" />

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Chip selected={view === "type"} onClick={() => setView("type")}>By type</Chip>
            <Chip selected={view === "goal"} onClick={() => setView("goal")}>By goal</Chip>
            <Chip selected={view === "attention"} onClick={() => setView("attention")}>Needs attention (2)</Chip>
          </div>

          <div className="flex flex-col gap-2.5">
            {sections.map((sec) => (
              <Card key={sec.key} padded={false}>
                <div className="flex items-center justify-between border-b border-sunken bg-sunken-2 px-3.5 py-3">
                  <span className="text-[13px] font-bold">{sec.label}</span>
                  <span className="text-[13px] font-bold">{inr(sec.total)}</span>
                </div>
                {sec.items.map((h, i) => {
                  const pill = holdingPill(h.status);
                  const href = h.decision ? `/decision/${h.decision}` : undefined;
                  const last = i === sec.items.length - 1 && !sec.more;
                  return (
                    <Row key={h.id} href={href} last={last}>
                      <RowText title={h.name} sub={h.sub} />
                      <div className="flex flex-col items-end gap-[3px]">
                        <span className="text-[13px] font-bold">{inr(h.value)}</span>
                        {pill && (
                          <Pill tone={h.decision && rebalance !== "proposed" ? "accent" : pill.tone} className="h-5 px-2 text-[10px]">
                            {h.decision && rebalance !== "proposed" ? (rebalance === "declined" ? "Declined" : "Placed") : pill.label}
                          </Pill>
                        )}
                      </div>
                    </Row>
                  );
                })}
                {sec.more && (
                  <button type="button" className="h-11 w-full text-[13px] font-bold text-accent">
                    Show {sec.more.count} more · {inr(sec.more.value)}
                  </button>
                )}
              </Card>
            ))}
            <button type="button" className="h-12 rounded-card border border-dashed border-line-3 text-[13px] font-bold text-accent">
              + Add something we can&apos;t see (property, cash, jewellery)
            </button>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
