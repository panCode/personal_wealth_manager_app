"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PortfolioHeader } from "@/components/portfolio";
import { Card, Chip, Row, RowText, Screen, SectionTitle } from "@/components/ui";
import { inr } from "@/lib/format";
import { persona } from "@/lib/persona";

const pf = persona.portfolio;
type Period = "1Y" | "3Y" | "5Y" | "All";

/** 7c · Portfolio · Performance tab */
export default function PortfolioPerformance() {
  const [period, setPeriod] = useState<Period>("3Y");
  const series = period === "1Y" ? { you: pf.growth.you.slice(-5), nifty: pf.growth.nifty.slice(-5) } : pf.growth;
  const youEnd = series.you[series.you.length - 1];
  const niftyEnd = series.nifty[series.nifty.length - 1];
  const base = series.you[0];
  const label = period === "1Y" ? "Sep 2025" : period === "3Y" ? "Sep 2023" : period === "5Y" ? "Sep 2021" : "Jan 2020";

  return (
    <>
      <Screen>
        <div className="safe-top flex flex-col gap-3.5 px-5 pb-4">
          <PortfolioHeader tab="performance" big={inr(pf.total)} bigNote={`+${inr(pf.gains)} on ${inr(pf.invested)} put in`} sub="Money-weighted return (XIRR), after all fees." />

          <Card className="flex flex-col gap-3">
            <div className="flex gap-1.5">
              {(["1Y", "3Y", "5Y", "All"] as Period[]).map((p) => (
                <Chip key={p} size="sm" selected={period === p} onClick={() => setPeriod(p)}>{p}</Chip>
              ))}
            </div>
            <div className="flex gap-3.5 text-[12px]">
              <span className="flex items-center gap-1.5"><span className="h-[3px] w-3.5 rounded-sm bg-accent" /><strong>You {pf.xirr3y}%</strong> a year</span>
              <span className="flex items-center gap-1.5 text-muted"><span className="w-3.5 border-t-[3px] border-dashed border-faint" />Nifty 50 {pf.nifty3y}%</span>
            </div>
            <LineChart you={series.you} nifty={series.nifty} startLabel={label} endLabel="Sep 2026" />
            <span className="text-[12px] leading-[1.45] text-muted">
              ₹{base} became ₹{youEnd} with you, ₹{niftyEnd} in Nifty 50. Nifty is shown for the equity part only; debt, EPF and PPF are judged against their own benchmarks.
            </span>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Tile label="Put in" value={inr(pf.invested)} />
            <Tile label="Gained" value={inr(pf.gains)} accent />
            <Tile label="Fees paid" value={inr(pf.fees3y)} />
          </div>

          <div className="flex flex-col gap-2.5">
            <SectionTitle>What moved it, last 3 years</SectionTitle>
            <Card padded={false}>
              {pf.movers.map((m, i) => (
                <Row key={m.name} last={i === pf.movers.length - 1}>
                  <RowText title={m.name} sub={m.sub} />
                  <span className={`text-[13px] font-bold ${m.amount < 0 ? "text-danger" : "text-accent"}`}>{m.amount < 0 ? "−" : "+"}{inr(Math.abs(m.amount))}</span>
                </Row>
              ))}
            </Card>
          </div>

          <div className="flex flex-col gap-2.5">
            <SectionTitle>By goal</SectionTitle>
            <Card padded={false}>
              {pf.byGoal.map((g, i) => (
                <Row key={g.name} last={i === pf.byGoal.length - 1}>
                  <RowText title={g.name} sub={g.sub} />
                  <span className="text-[13px] font-bold">{g.xirr}% a year</span>
                </Row>
              ))}
            </Card>
            <span className="text-[12px] leading-[1.45] text-muted">Each goal is judged against its own job, not the market. A 6.8% emergency fund is doing exactly what it should.</span>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-line bg-surface p-3">
      <span className="text-[11px] font-semibold text-muted">{label}</span>
      <span className={`font-display text-[20px] ${accent ? "text-accent" : ""}`}>{value}</span>
    </div>
  );
}

function LineChart({ you, nifty, startLabel, endLabel }: { you: number[]; nifty: number[]; startLabel: string; endLabel: string }) {
  const w = 350, h = 150, x0 = 10, x1 = 340, yTop = 20, yBottom = 130;
  const lo = 100, hi = Math.max(150, ...you, ...nifty);
  const sx = (i: number, n: number) => x0 + (i * (x1 - x0)) / (n - 1);
  const sy = (v: number) => yBottom - ((v - lo) / (hi - lo)) * (yBottom - yTop);
  const path = (arr: number[]) => arr.map((v, i) => `${sx(i, arr.length).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none" role="img" aria-label="Your portfolio versus Nifty 50, both rising, yours slightly higher">
      {[yBottom, (yTop + yBottom) / 2, yTop].map((y) => (
        <line key={y} x1={x0} y1={y} x2={x1} y2={y} stroke="#EEEBE3" />
      ))}
      <text x={x1 + 2} y={yBottom + 4} fontSize="10" fill="#8A948F">{lo}</text>
      <text x={x1 + 2} y={yTop + 4} fontSize="10" fill="#8A948F">{hi}</text>
      <polyline points={path(nifty)} stroke="#8A948F" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={path(you)} stroke="#0E6B55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x1} cy={sy(you[you.length - 1])} r="4" fill="#0E6B55" />
      <text x={x0} y={h - 4} fontSize="10" fill="#8A948F">{startLabel}</text>
      <text x={x1} y={h - 4} fontSize="10" fill="#8A948F" textAnchor="end">{endLabel}</text>
    </svg>
  );
}
