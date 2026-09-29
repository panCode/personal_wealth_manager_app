"use client";

import { useMemo } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { Button, Card, Footer, Screen, TopBar, cx } from "@/components/ui";
import { assumptions, computeGoals } from "@/lib/goals";
import { inr, inrFull } from "@/lib/format";
import { jobLossScenario, raiseScenario } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { useGoals } from "@/lib/useGoals";

type Id = "house-2029" | "retire-55" | "raise-30" | "job-loss";
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ym = (d: { year: number; month: number }) => `${M[d.month - 1]} ${d.year}`;

/** The what-ifs that are just the goal formulas with one input changed. */
export function SimpleSimulation({ id }: { id: Id }) {
  const goals = useGoals();
  const ob = useStore((s) => s.onboarding);

  const view = useMemo(() => {
    if (id === "house-2029") {
      const after = computeGoals({ ...ob, home: { ...ob.home, year: 2029 } });
      const extra = Math.max(0, after.home.needed - goals.home.sip);
      return {
        label: "What if · House by 2029",
        verdict: extra > 0 ? `Possible, if you find ${inrFull(Math.round(extra / 500) * 500)} more a month.` : "Possible without changing anything.",
        sub: `Two years less growth means ${inr(after.home.total)} upfront instead of ${inr(goals.home.total)}, and less time to save it.`,
        rows: [
          ["Upfront cash needed", inr(goals.home.total), inr(after.home.total), "attn"],
          ["Home SIP needed", inrFull(goals.home.sip), inrFull(Math.round(after.home.needed / 500) * 500), extra > 0 ? "attn" : "accent"],
          ["Left for goals / month", inrFull(goals.surplus), inrFull(goals.surplus - extra), extra > 0 ? "attn" : "accent"],
          ["Emergency fund", ym(goals.emergency.reach), extra > goals.surplus - 60_000 ? "pauses" : ym(goals.emergency.reach), "accent"],
          ["Retire at 60", goals.retire.shortBy > 0 ? `${inr(goals.retire.shortBy)}/mo short` : "on track", "same", "accent"],
        ] as const,
        ways: [
          `Sell the current flat first: its equity covers most of the upfront cash, and the 2029 date holds.`,
          `Cut the budget to ${inr(ob.home.budgetToday * 0.8)}: ${inr(after.home.total * 0.8)} upfront, ${inrFull(Math.round((after.home.needed * 0.8) / 500) * 500)} a month.`,
          `Keep 2031. Nothing changes.`,
        ],
        cta: { label: "Ask Meera about 2029", href: "/ask" },
      };
    }
    if (id === "retire-55") {
      const after = computeGoals({ ...ob, retire: { ...ob.retire, retireAt: 55 } });
      return {
        label: "What if · Retire at 55",
        verdict: `Five years earlier needs ${inrFull(after.retire.needed)} a month, not ${inrFull(goals.retire.needed)}.`,
        sub: `Five fewer years of saving and five more years of spending. The corpus in today's money goes from ${inr(goals.retire.corpusToday)} to ${inr(after.retire.corpusToday)}.`,
        rows: [
          ["Corpus, today's money", inr(goals.retire.corpusToday), inr(after.retire.corpusToday), "attn"],
          ["Years to save", String(goals.retire.yearsToRetire), String(after.retire.yearsToRetire), "attn"],
          ["Years to fund", String(goals.retire.yearsInRetirement), String(after.retire.yearsInRetirement), "attn"],
          ["Retirement SIP needed", inrFull(goals.retire.needed), inrFull(after.retire.needed), "attn"],
          ["Short by, today", inrFull(goals.retire.shortBy), inrFull(after.retire.shortBy), "attn"],
        ] as const,
        ways: [
          `A "simpler" retirement (80% of today's spending) brings it to ${inrFull(computeGoals({ ...ob, retire: { retireAt: 55, lifestyle: "simpler" } }).retire.needed)} a month.`,
          `Retire at 57 instead: ${inrFull(computeGoals({ ...ob, retire: { ...ob.retire, retireAt: 57 } }).retire.needed)} a month.`,
          `Put every raise for the next 5 years into retirement first. Salary growth does most of the work.`,
        ],
        cta: { label: "Ask Meera about 55", href: "/ask" },
      };
    }
    if (id === "raise-30") {
      const r = raiseScenario(goals, ob, 0.3);
      return {
        label: "What if · New job, +30%",
        verdict: `${inrFull(r.extra)} more a month. Retirement closes, the home moves up to ${r.homeReach.year}.`,
        sub: "We'd split it before it reaches your spending: half to retirement, a quarter to the home, a quarter for you.",
        rows: [
          ["Left for goals / month", inrFull(goals.surplus), inrFull(r.surplusAfter), "accent"],
          ["Retirement SIP", inrFull(goals.retire.sip), inrFull(r.retireSip), "accent"],
          ["Retire at 60", goals.retire.shortBy > 0 ? `${inr(goals.retire.shortBy)}/mo short` : "on track", r.retireOnTrack ? "on track" : "still short", r.retireOnTrack ? "accent" : "attn"],
          ["Home SIP", inrFull(goals.home.sip), inrFull(r.homeSip), "accent"],
          ["Bigger home", String(goals.home.reach.year), String(r.homeReach.year), "accent"],
          ["Extra wealth at 60, today's money", "—", `+${inr(r.retireExtraAt60)}`, "accent"],
        ] as const,
        ways: [
          "Lock the split in before the first new salary lands. Lifestyle creep starts in month two.",
          "Re-check the tax regime: at the new income the old regime may start to win.",
          "If the new job has ESOPs, tell us the vesting schedule; that's a separate plan.",
        ],
        cta: { label: "Set up the split as a decision", href: "/decision/stepup-1" },
      };
    }
    const j = jobLossScenario(goals, 6);
    return {
      label: "What if · No income for 6 months",
      verdict: j.shortfall > 0 ? `You'd get ${j.coveredMonths.toFixed(1)} months from the emergency fund. The gap is ${inr(j.shortfall)}.` : "The emergency fund covers it. Nothing has to be sold.",
      sub: "SIPs pause, EMI continues, spending stays at today's level. Equity is never touched for this.",
      rows: [
        ["Six months of expenses", "—", inr(j.need), "attn"],
        ["Emergency fund today", inr(j.fund), inr(j.fund), "accent"],
        ["Gap", "—", j.shortfall > 0 ? inr(j.shortfall) : "none", j.shortfall > 0 ? "attn" : "accent"],
        ["Bigger home", String(goals.home.reach.year), String(j.homeReach.year), "attn"],
        ["Emergency fund rebuilt by", ym(goals.emergency.reach), ym(j.emergencyReach), "attn"],
      ] as const,
      ways: [
        j.shortfall > 0 ? `Cover the ${inr(j.shortfall)} gap from the liquid part of the home bucket, not from equity.` : "Nothing to do now. The fund is doing its job.",
        `Finish the emergency fund first: at ${inrFull(goals.emergency.sip)} a month it's full by ${ym(goals.emergency.reach)}. Every month sooner is a month of cover.`,
        "The term cover and health top-up already protect the two worse cases.",
      ],
      cta: { label: "Move ₹700 more to the emergency SIP", href: "/decision/subs-1" },
    };
  }, [id, goals, ob]);

  return (
    <>
      <TopBar back="/scenarios" label={view.label} />
      <Screen>
        <div className="flex flex-col gap-3.5 px-5 pb-4 pt-1">
          <div className="flex flex-col gap-1.5 rounded-card-lg bg-ink p-4 text-white">
            <span className="font-display text-[22px] leading-[1.2]">{view.verdict}</span>
            <span className="text-[13px] text-on-dark-muted">{view.sub}</span>
          </div>
          <Card padded={false}>
            <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-sunken bg-sunken-2 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
              <span />
              <span className="text-right">Today&apos;s plan</span>
              <span className="text-right">What if</span>
            </div>
            {view.rows.map(([label, a, b, tone], i) => (
              <div key={label} className={cx("grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 px-3.5 py-2.5 text-[13px]", i < view.rows.length - 1 && "border-b border-sunken")}>
                <span className="font-semibold">{label}</span>
                <span className="text-right text-muted">{a}</span>
                <span className={cx("text-right font-bold", tone === "attn" ? "text-attn-text" : "text-accent")}>{b}</span>
              </div>
            ))}
          </Card>
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] font-bold">Ways to make it work</span>
            <Card padded={false}>
              {view.ways.map((w, i) => (
                <div key={i} className={cx("flex gap-2.5 px-3.5 py-3 text-[13px] leading-[1.45]", i < view.ways.length - 1 && "border-b border-sunken")}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">{i + 1}</span>
                  <span>{w}</span>
                </div>
              ))}
            </Card>
            <span className="text-[11px] leading-[1.45] text-muted">Assumes {assumptions.inflation * 100}% inflation, {assumptions.equityReturn * 100}% equity, {assumptions.balancedReturn * 100}% balanced funds. Estimates, not promises.</span>
          </div>
        </div>
      </Screen>
      <Footer>
        <Button href={view.cta.href}>
          {view.cta.label} <ArrowRightIcon size={18} />
        </Button>
        <Button href="/scenarios" variant="ghost" size="md">Try another</Button>
      </Footer>
    </>
  );
}
