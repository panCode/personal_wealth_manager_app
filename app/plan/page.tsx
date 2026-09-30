"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Button, Card, Chip, Pill, ProgressBar, Row, RowText, Screen, SectionTitle } from "@/components/ui";
import { inr, inrFull, monthYear } from "@/lib/format";
import { useGoals } from "@/lib/useGoals";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

const p = persona;

/** 8 · Plan & goals */
export default function Plan() {
  const stepup = useStore((s) => s.decisions["stepup-1"]?.status ?? "proposed");
  const retireFixed = stepup === "approved" || stepup === "placed" || stepup === "settled";
  const goals = useGoals();
  const emergencyBy = monthYear(`${goals.emergency.reach.year}-${String(goals.emergency.reach.month).padStart(2, "0")}-01`);
  const short = retireFixed ? 0 : goals.retire.shortBy;
  const monthly = goals.emergency.sip + goals.home.sip + (retireFixed ? goals.retire.needed : goals.retire.sip);

  return (
    <>
      <Screen>
        <div className="safe-top flex flex-col gap-4 px-5 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[26px]">Your plan</h1>
            <span className="text-[14px] text-ink-2">
              {short > 0
                ? `${inrFull(monthly)} a month across 3 goals. Two on track; retirement needs ${inrFull(short)} more.`
                : `${inrFull(monthly)} a month across 3 goals. All on track.`}
            </span>
          </div>

          {p.goals.map((g) => {
            const behind = g.id === "retire" && short > 0;
            const target = g.id === "emergency" ? goals.emergency.target : g.id === "home" ? goals.home.total : goals.retire.corpusToday;
            const pct = (g.saved / target) * 100;
            const chip = g.id === "emergency" ? emergencyBy : g.id === "home" ? String(goals.home.reach.year) : behind ? `${inrFull(short)} short` : String(goals.retire.year);
            const title = g.id === "home" ? "Home down payment" : g.id === "retire" ? "Retire at 60" : g.name;
            const sip = g.id === "retire" && retireFixed ? goals.retire.needed : g.sip;
            return (
              <Card key={g.id} className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-bold">{title}</span>
                    <span className="text-[12px] text-muted">{g.vehicle} · {inrFull(sip)} / month</span>
                  </div>
                  <Pill tone={behind ? "attn" : "accent"} className="h-6">{chip}</Pill>
                </div>
                <ProgressBar value={pct} tone={behind ? "attn" : "accent"} height={8} />
                <div className="flex justify-between text-[12px]">
                  <span className="font-bold">{inr(g.saved)} saved</span>
                  <span className="text-muted">of {inr(target)}{g.id === "emergency" ? ` (${goals.emergency.months} months)` : g.id === "retire" ? " needed in today's money" : ""}</span>
                </div>
                {behind && (
                  <div className="flex items-center justify-between gap-2.5 rounded-[10px] bg-ground px-3 py-2.5">
                    <span className="text-[12px] leading-[1.4]">Step up to {inrFull(goals.retire.needed)} from October, when your revision lands, and {goals.retire.year} is back on track.</span>
                    <Button href="/decision/stepup-1" size="sm" className="shrink-0">Set up</Button>
                  </div>
                )}
              </Card>
            );
          })}

          <div className="flex flex-col gap-2.5">
            <SectionTitle>Protection</SectionTitle>
            <Card padded={false}>
              <Row>
                <RowText title="Term life · ₹1 Cr" sub={p.protection.term.note} />
                <Pill tone="accent">Adequate</Pill>
              </Row>
              <Row href="/ask?q=insurance" last>
                <RowText title="Health · ₹10L family floater" sub="₹25L super top-up issued 6 Sep. Renews 3 Sep 2027." />
                <Pill tone="accent">Done</Pill>
              </Row>
            </Card>
          </div>

          <div className="flex flex-col gap-2.5">
            <SectionTitle action={<Link href="/scenarios" className="text-[13px] font-bold text-accent">All scenarios</Link>}>What if…</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <Chip href="/simulate/car">I buy a ₹12L car</Chip>
              <Chip href="/scenarios">House by 2029 instead</Chip>
              <Chip href="/scenarios">I lose my job for 6 months</Chip>
            </div>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
