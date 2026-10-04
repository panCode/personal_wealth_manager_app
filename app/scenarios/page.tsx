"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { AlertShieldIcon, BoltIcon, CarIcon, ClockIcon, GrowthIcon, HomeIcon, PeopleIcon, RupeeIcon, SearchIcon } from "@/components/icons";
import { Card, Eyebrow, Pill, Screen, TopBar, cx } from "@/components/ui";
import { useStore } from "@/lib/store";

type Preset = { id: string; name: string; sub: string; icon: React.ReactNode; attn?: boolean; soon?: boolean };

const groups: Array<{ title: string; items: Preset[] }> = [
  {
    title: "Big purchases",
    items: [
      { id: "car", name: "Buy a car", sub: "Loan or cash, new or used", icon: <CarIcon size={22} /> },
      { id: "house-2029", name: "Buy the home in 2029", sub: "Two years earlier than planned", icon: <HomeIcon size={22} /> },
    ],
  },
  {
    title: "Work & income",
    items: [
      { id: "raise-30", name: "New job, +30%", sub: "Or a raise, or ESOPs vesting", icon: <GrowthIcon size={22} /> },
      { id: "job-loss", name: "No income for 6 months", sub: "Layoff, sabbatical, or starting up", icon: <BoltIcon size={22} />, attn: true },
      { id: "bonus", name: "₹5L bonus lands", sub: "Prepay, invest, or spend", icon: <RupeeIcon size={22} />, soon: true },
      { id: "retire-55", name: "Retire at 55", sub: "Five years earlier", icon: <ClockIcon size={22} /> },
    ],
  },
  {
    title: "Family",
    items: [
      { id: "child", name: "Second child", sub: "Costs now, education later", icon: <PeopleIcon size={22} />, soon: true },
      { id: "medical", name: "₹15L medical bill", sub: "A parent, beyond insurance", icon: <AlertShieldIcon size={22} />, attn: true, soon: true },
    ],
  },
];

/** 15 · What if: pick a scenario */
export default function Scenarios() {
  const [q, setQ] = useState("");
  const prepay = useStore((s) => s.decisions["prepay-1"]?.status);
  const track = useStore((s) => s.track);

  return (
    <>
      <TopBar back="/plan" />
      <Screen>
        <div className="flex flex-col gap-[18px] px-5 pb-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[30px] leading-[1.12] tracking-[-0.01em]">What if…</h1>
            <p className="text-[15px] leading-[1.5] text-ink-2">Try a life event on your real numbers before you decide. See what it does to each goal and to your wealth at 60.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              track("scenario_custom", { q });
            }}
            className="flex h-[52px] items-center gap-2 rounded-btn border border-line-2 bg-surface px-3.5"
          >
            <SearchIcon size={18} className="text-muted" />
            <label htmlFor="own" className="sr-only">Describe your own scenario</label>
            <input id="own" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Describe your own, e.g. move to Pune for a ₹30L job" className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none" />
          </form>
          {q.trim().length > 3 && (
            <div className="rounded-xl bg-sunken px-3.5 py-3 text-[12px] leading-[1.45] text-ink-2">
              Custom scenarios go to Meera in this prototype: she models it and sends it back within a day. <Link href="/ask" className="font-bold text-accent">Send it to her</Link>
            </div>
          )}

          {groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-2.5">
              <Eyebrow>{g.title}</Eyebrow>
              <div className="grid grid-cols-2 gap-2.5">
                {g.items.map((p) =>
                  p.soon ? (
                    <div key={p.id} className="flex min-h-[104px] flex-col gap-2 rounded-card border border-dashed border-line-3 bg-surface p-3.5 opacity-70">
                      <span className="text-accent">{p.icon}</span>
                      <span className="text-[14px] font-bold">{p.name}</span>
                      <span className="text-[12px] text-muted">Coming soon</span>
                    </div>
                  ) : (
                    <Link key={p.id} href={`/simulate/${p.id}`} onClick={() => track("scenario_open", { id: p.id })} className={cx("flex min-h-[104px] flex-col gap-2 rounded-card border border-line bg-surface p-3.5 text-ink")}>
                      <span className="text-accent">{p.icon}</span>
                      <span className="text-[14px] font-bold">{p.name}</span>
                      <span className="text-[12px] text-muted">{p.sub}</span>
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <Eyebrow>Saved scenarios</Eyebrow>
            <Card className="flex items-center gap-3 px-3.5 py-3">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[13px] font-bold">Prepay ₹1.9L of the home loan</span>
                <span className="text-[12px] text-muted">From the Ask screen · {prepay ? "became a decision" : "not decided yet"}</span>
              </div>
              <Pill tone={prepay === "declined" ? "neutral" : prepay ? "accent" : "attn"}>{prepay === "declined" ? "Declined" : prepay ? "Approved" : "Open"}</Pill>
            </Card>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
