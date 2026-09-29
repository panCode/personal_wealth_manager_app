"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ArrowRightIcon, BellIcon, CheckIcon, ChevronRightIcon, ClockIcon, DocIcon, GrowthIcon, SwapIcon } from "@/components/icons";
import { Avatar, Card, DarkCard, Eyebrow, IconBox, Pill, ProgressBar, Row, RowText, Screen, SectionTitle } from "@/components/ui";
import { decisions } from "@/lib/decisions";
import { dayLine, greeting, inr, inrFull, monthYear } from "@/lib/format";
import { useGoals } from "@/lib/useGoals";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

const p = persona;

/** 5 · Home */
export default function Home() {
  const rebalance = useStore((s) => s.decisions["rebalance-1"]?.status ?? "proposed");
  const stepup = useStore((s) => s.decisions["stepup-1"]?.status ?? "proposed");
  const waiting = rebalance === "proposed" ? 1 : 0;
  const d = decisions["rebalance-1"];
  const goals = useGoals();
  // `hydrated` flips only on the client after mount, so reading the clock here
  // never disagrees with the server-rendered HTML.
  const hydrated = useStore((s) => s.hydrated);
  const today = hydrated ? dayLine() : "";
  const hello = hydrated ? greeting() : "Hello";
  const emergencyBy = monthYear(`${goals.emergency.reach.year}-${String(goals.emergency.reach.month).padStart(2, "0")}-01`);
  const retireShort = stepup === "proposed" ? goals.retire.shortBy : 0;

  return (
    <>
      <Screen>
        <div className="safe-top flex flex-col gap-4 px-5 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="min-h-[18px] text-[13px] text-muted">{today}</span>
              <span className="font-display text-[24px]">{hello}, {p.firstName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/notifications" aria-label={`Notifications, ${waiting} need you`} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink">
                <BellIcon size={20} />
                {waiting > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-attn px-1 text-[11px] font-bold text-white">{waiting}</span>
                )}
              </Link>
              <Link href="/settings" aria-label="Prototype settings"><Avatar initials={p.initials} size={40} dark /></Link>
            </div>
          </div>

          {/* Net worth */}
          <DarkCard className="flex flex-col gap-3 p-[18px]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-on-dark-muted">Net worth</span>
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-display text-[38px] leading-none">{inr(p.netWorth.total)}</span>
                <span className="text-[13px] font-semibold text-accent-light">+{inr(p.netWorth.monthChange)} this month · +{p.netWorth.monthChangePct}%</span>
              </div>
              <Sparkline points={p.sparkline} />
            </div>
            <div className="flex gap-3.5 text-[12px] text-on-dark-muted">
              <span>Assets {inr(p.netWorth.assets)}</span>
              <span>Loans {inr(p.netWorth.loans)}</span>
            </div>
          </DarkCard>

          {/* Decision waiting / in progress */}
          {rebalance === "proposed" && (
            <Link href={`/decision/${d.id}`} className="flex flex-col gap-2.5 rounded-card-lg border border-attn-line bg-attn-soft p-4 text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-attn" />
                <Eyebrow tone="attn">1 decision waiting for you</Eyebrow>
              </div>
              <span className="text-[16px] font-bold leading-[1.3]">{d.summary}</span>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted">Reviewed by {d.reviewedBy} · {d.takes}</span>
                <span className="flex h-9 items-center gap-1.5 rounded-[10px] bg-ink px-3.5 text-[13px] font-bold text-white">
                  Review <ArrowRightIcon size={16} strokeWidth={2.2} />
                </span>
              </div>
            </Link>
          )}
          {(rebalance === "approved" || rebalance === "placed") && (
            <Link href="/activity" className="flex items-center gap-3 rounded-card-lg border border-line bg-accent-soft p-4 text-ink">
              <IconBox tone="accent" size={32}><CheckIcon size={16} /></IconBox>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[13px] font-bold">Rebalance placed. Settles by 1 Oct.</span>
                <span className="text-[12px] text-muted">We’ll message you when the units land.</span>
              </div>
              <ChevronRightIcon size={18} className="text-muted" />
            </Link>
          )}

          {/* Where you stand */}
          <Card className="flex flex-col gap-3">
            <SectionTitle action={<Link href="/plan" className="text-[13px] font-bold text-accent">Full plan</Link>}>Where you stand</SectionTitle>
            {p.goals.map((g) => {
                            const target = g.id === "emergency" ? goals.emergency.target : g.id === "home" ? goals.home.total : goals.retire.corpusToday;
              const pct = Math.round((g.saved / target) * 100);
              const label =
                g.id === "emergency"
                  ? `On track · ${emergencyBy}`
                  : g.id === "home"
                    ? goals.home.onTrack ? `On track · ${goals.home.reach.year}` : `${goals.home.reach.year}, a little late`
                    : retireShort > 0 ? `${inrFull(retireShort)} a month short` : `On track · ${goals.retire.year}`;
              const tone = (g.id === "retire" && retireShort > 0) || (g.id === "home" && !goals.home.onTrack) ? "attn" : "accent";
              return (
                <div key={g.id} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold">{g.id === "home" ? "Home down payment" : g.id === "retire" ? "Retire at 60" : g.name}</span>
                    <span className={`text-[12px] font-bold ${tone === "attn" ? "text-attn-text" : "text-accent"}`}>{label}</span>
                  </div>
                  <ProgressBar value={pct} tone={tone} />
                  <span className="text-[11px] text-muted">
                    {inr(g.saved)} of {inr(target)} · {inr(g.sip, { compact: false })} a month{g.id === "retire" && retireShort > 0 ? `, needs ${inrFull(goals.retire.needed)}` : ""}
                  </span>
                </div>
              );
            })}
          </Card>

          {/* How we get you there */}
          <div className="flex flex-col gap-2.5">
            <SectionTitle>How we get you there</SectionTitle>
            <Card padded={false}>
              <Row href={`/decision/rebalance-1`}>
                <IconBox tone={rebalance === "proposed" ? "attn" : "accent"}><SwapIcon size={16} /></IconBox>
                <RowText title="Rebalance the drifted large-caps" sub="Keeps your risk where the plan set it" />
                <Pill tone={rebalance === "proposed" ? "attn" : "accent"}>{rebalance === "proposed" ? "Approve" : rebalance === "declined" ? "Declined" : "Placed"}</Pill>
              </Row>
              <Row href={`/decision/stepup-1`}>
                <IconBox><GrowthIcon size={16} /></IconBox>
                <RowText title={`Step up retirement SIP by ${inrFull(Math.max(goals.retire.shortBy, 4_000))} in October`} sub="Timed to your salary revision. Closes the gap." />
                <Pill tone="accent">{stepup === "proposed" ? "Set up" : stepup === "declined" ? "Declined" : "Done"}</Pill>
              </Row>
              <Row href="/ask">
                <IconBox><DocIcon size={16} /></IconBox>
                <RowText title="Save ₹31,000 more tax this year" sub="NPS under 80CCD(1B), HRA you're not claiming" />
                <Pill tone="accent">See how</Pill>
              </Row>
              <Row last>
                <IconBox tone="neutral"><ClockIcon size={16} /></IconBox>
                <RowText title="Move ₹2.2L regular-plan fund to direct" sub="Saves ~₹2,400 a year in fees. Lock-in ends March." />
                <Pill>Mar 2027</Pill>
              </Row>
            </Card>
            <span className="text-[12px] leading-[1.45] text-muted">Every day we watch your funds, SIPs, EMIs and tax rules. You only hear from us when there’s a decision worth your minute.</span>
          </div>

          {/* Health strip */}
          <div className="grid grid-cols-3 gap-2">
            <Tile label="Emergency fund" value="4.2 mo" pct={70} tone="attn" foot="Target 6 mo" footTone="attn" />
            <Tile label="Term cover" value="₹1 Cr" pct={100} tone="accent" foot="Adequate" footTone="accent" />
            <Tile label="Tax saved FY26" value="₹46.8k" pct={60} tone="accent" foot="₹31k more possible" />
          </div>

          {/* Spending */}
          <Link href="/spending" className="flex items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 text-ink">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-bold">Spent this month</span>
                <span className="text-[13px] font-bold">
                  {inr(p.spending.total, { compact: false })} <span className="font-semibold text-accent">· 6% under usual</span>
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-sunken">
                {p.spending.categories.map((c) => (
                  <div key={c.key} style={{ width: `${(c.amount / p.spending.total) * 100}%`, background: c.color }} />
                ))}
              </div>
              <span className="text-[12px] font-semibold text-attn-text">3 spends need a label · 2 unused subscriptions found</span>
            </div>
            <ChevronRightIcon size={18} className="text-muted" />
          </Link>

          {/* Watched today */}
          <div className="flex flex-col gap-2.5">
            <SectionTitle action={<Link href="/activity" className="text-[13px] font-bold text-accent">See all</Link>}>Your CFO watched today</SectionTitle>
            <Card padded={false}>
              <Row>
                <IconBox><CheckIcon size={16} strokeWidth={2} /></IconBox>
                <RowText title="Nifty fell 1.8%. No action needed." sub="Your plan assumes swings like this. Holding." />
              </Row>
              <Row>
                <IconBox><CheckIcon size={16} strokeWidth={2} /></IconBox>
                <RowText title="SIP of ₹35,000 went through" sub="Split across 3 goals as planned." />
              </Row>
              <Row last>
                <IconBox tone="neutral"><ClockIcon size={16} /></IconBox>
                <RowText title="Home loan EMI ₹38,400 due 5 Oct" sub="Balance is sufficient. Nothing to do." />
              </Row>
            </Card>
          </div>

          {/* Wealth manager */}
          <Card className="flex items-center gap-3 px-3.5 py-3">
            <Avatar initials={p.wealthManager.initials} />
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[13px] font-bold">{p.wealthManager.name}, your wealth manager</span>
              <span className="text-[12px] text-muted">SEBI RIA · reviewed your plan on 1 Sep</span>
            </div>
            <Link href="/ask" className="flex h-9 items-center rounded-[10px] border border-accent px-3 text-[13px] font-bold text-accent">Talk</Link>
          </Card>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}

function Tile({ label, value, pct, tone, foot, footTone }: { label: string; value: string; pct: number; tone: "accent" | "attn"; foot: string; footTone?: "accent" | "attn" }) {
  const ft = footTone === "attn" ? "text-attn-text" : footTone === "accent" ? "text-accent" : "text-muted";
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-3">
      <span className="text-[11px] font-semibold text-muted">{label}</span>
      <span className="font-display text-[20px]">{value}</span>
      <ProgressBar value={pct} tone={tone} height={5} />
      <span className={`text-[11px] font-semibold ${ft}`}>{foot}</span>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 120;
  const step = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${y + 4}`).join(" ");
  const last = points[points.length - 1] + 4;
  return (
    <svg width={w} height={44} viewBox={`0 0 ${w} 44`} fill="none" aria-hidden="true">
      <path d={d} stroke="#9FD9C4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={last} r={3} fill="#9FD9C4" />
    </svg>
  );
}
