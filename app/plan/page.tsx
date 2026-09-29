"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { Button, Card, Chip, Pill, ProgressBar, Row, RowText, Screen, SectionTitle } from "@/components/ui";
import { inr, inrFull } from "@/lib/format";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

const p = persona;

/** 8 · Plan & goals */
export default function Plan() {
  const stepup = useStore((s) => s.decisions["stepup-1"]?.status ?? "proposed");
  const retireFixed = stepup === "approved" || stepup === "placed" || stepup === "settled";

  return (
    <>
      <Screen>
        <div className="safe-top flex flex-col gap-4 px-5 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[26px]">Your plan</h1>
            <span className="text-[14px] text-ink-2">
              {retireFixed ? "₹66,000 a month from October, split across 3 goals. All on track." : "₹62,000 a month, split across 3 goals. Two on track; retirement needs ₹4,000 more."}
            </span>
          </div>

          {p.goals.map((g) => {
            const behind = g.id === "retire" && !retireFixed;
            const pct = (g.saved / g.target) * 100;
            const chip = g.id === "emergency" ? "Mar 2027" : g.id === "home" ? "2031" : retireFixed ? "2055" : "₹4,000 short";
            const title = g.id === "home" ? "Home down payment" : g.id === "retire" ? "Retire at 60" : g.name;
            const sip = g.id === "retire" && retireFixed ? 26_000 : g.sip;
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
                  <span className="text-muted">of {inr(g.target)}{g.id === "emergency" ? " (6 months)" : g.id === "retire" ? " needed in today's money" : ""}</span>
                </div>
                {behind && (
                  <div className="flex items-center justify-between gap-2.5 rounded-[10px] bg-ground px-3 py-2.5">
                    <span className="text-[12px] leading-[1.4]">Step up to ₹26,000 from October, when your revision lands, and 2055 is back on track.</span>
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
              <Row href="/ask" last>
                <RowText title="Health · ₹10L family floater" sub="Bengaluru hospital costs suggest a ₹25L top-up" />
                <Pill tone="attn">Top-up</Pill>
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
