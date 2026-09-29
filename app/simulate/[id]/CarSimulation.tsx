"use client";

import { useMemo, useState } from "react";
import { Drawer } from "@/components/Drawer";
import { MoneyInput } from "@/components/inputs";
import { ArrowRightIcon, BookmarkIcon, ChevronRightIcon } from "@/components/icons";
import { Button, Card, Footer, OptionGroup, Screen, SectionTitle, TopBar, cx } from "@/components/ui";
import { inr, inrFull } from "@/lib/format";
import { carAlternatives, carScenario, defaultCar, type CarInput } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { useGoals } from "@/lib/useGoals";

export function CarSimulation() {
  const goals = useGoals();
  const ob = useStore((s) => s.onboarding);
  const track = useStore((s) => s.track);
  const [input, setInput] = useState<CarInput>(defaultCar);
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const r = useMemo(() => carScenario(input, goals, ob), [input, goals, ob]);

  const slip = r.homeSlipYears;
  const verdict =
    r.surplusAfter <= 0
      ? "This doesn't fit. The EMI eats everything you put towards goals."
      : slip <= 0
        ? "You can afford it, and nothing slips."
        : `You can afford it. The bigger home moves from ${r.homeReachBefore.year} to ${r.homeReachAfter.year}.`;
  const w60Delta = r.w60Before - r.w60After;

  return (
    <>
      <TopBar
        back="/scenarios"
        label="What if · Buy a car"
        right={
          <button type="button" aria-label="Save scenario" onClick={() => { setSaved(true); track("scenario_saved", { id: "car" }); }} className={cx("flex h-11 w-11 items-center justify-center rounded-xl", saved ? "text-accent" : "text-ink")}>
            <BookmarkIcon size={20} />
          </button>
        }
      />
      <Screen>
        <div className="flex flex-col gap-3.5 px-5 pb-4 pt-1">
          <Card padded={false}>
            <InputRow label="On-road price" value={inr(input.price)} onClick={() => setEdit(true)} />
            <InputRow label="Down payment" sub="from the home bucket, not the emergency fund" value={inr(input.down)} onClick={() => setEdit(true)} />
            <InputRow label="Loan" sub={`${input.years} years at ${(input.rate * 100).toFixed(1)}%`} value={`${inrFull(Math.round(r.emi / 100) * 100)} / mo`} onClick={() => setEdit(true)} />
            <InputRow label="Running costs" sub="fuel, insurance, service, estimated" value={`${inrFull(input.running)} / mo`} onClick={() => setEdit(true)} />
            <InputRow label="When" value={`${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][input.startMonth - 1]} ${input.startYear}`} onClick={() => setEdit(true)} last />
          </Card>

          <div className="flex flex-col gap-1.5 rounded-card-lg bg-ink p-4 text-white">
            <span className="font-display text-[22px] leading-[1.2]">{verdict}</span>
            <span className="text-[13px] text-on-dark-muted">
              {inrFull(Math.round(r.hit / 100) * 100)} a month less for goals for {input.years} years. Emergency fund and retirement stay untouched.
            </span>
          </div>

          <Card padded={false}>
            <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-sunken bg-sunken-2 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-muted">
              <span />
              <span className="text-right">Today&apos;s plan</span>
              <span className="text-right">With the car</span>
            </div>
            <CmpRow label="Left for goals / month" a={inrFull(r.surplusBefore)} b={inrFull(r.surplusAfter)} tone={r.surplusAfter < r.surplusBefore ? "attn" : "accent"} />
            <CmpRow label="Emergency fund" a={ym(goals.emergency.reach)} b={ym(goals.emergency.reach)} tone="accent" />
            <CmpRow label="Bigger home" a={String(r.homeReachBefore.year)} b={String(r.homeReachAfter.year)} tone={slip > 0 ? "attn" : "accent"} />
            <CmpRow label="Retire at 60" a={goals.retire.shortBy > 0 ? `${inr(goals.retire.shortBy)}/mo short` : "on track"} b="same" tone="accent" />
            <CmpRow label="Wealth at 60 · today's money" a={inr(r.w60Before)} b={inr(r.w60After)} tone={w60Delta > 0 ? "attn" : "accent"} last />
          </Card>

          <Card className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold">Net worth, next 10 years</span>
              <span className="text-[11px] text-muted">₹ lakh</span>
            </div>
            <div className="flex gap-3.5 text-[12px]">
              <span className="flex items-center gap-1.5"><span className="h-[3px] w-3.5 rounded-sm bg-accent" />Today&apos;s plan</span>
              <span className="flex items-center gap-1.5 text-attn-text"><span className="h-[3px] w-3.5 rounded-sm bg-attn" />With the car</span>
            </div>
            <PathChart a={r.pathBefore} b={r.pathAfter} />
            <span className="text-[12px] leading-[1.45] text-muted">
              The gap is the car&apos;s cost plus the returns that money would have earned: {inr(r.pathBefore[10] - r.pathAfter[10])} by {2026 + 10}, about {inr(w60Delta)} at 60 in today&apos;s money.
            </span>
          </Card>

          <div className="flex flex-col gap-2.5">
            <SectionTitle>Ways to make it work</SectionTitle>
            <Card padded={false}>
              {carAlternatives.map((alt, i) => {
                const rr = carScenario(alt.input(defaultCar), goals, ob);
                const good = rr.homeSlipYears <= 0;
                return (
                  <div key={alt.id} className={cx("flex items-center gap-3 px-3.5 py-3", i < carAlternatives.length - 1 && "border-b border-sunken")}>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[13px] font-bold">{alt.title}</span>
                      <span className={cx("text-[12px] font-semibold", good ? "text-accent" : "text-muted")}>{alt.outcome(rr)}{good && !alt.outcome(rr).includes("stays") ? " · nothing slips" : ""}</span>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => { setInput(alt.input(defaultCar)); track("scenario_try", { id: alt.id }); }}>Try</Button>
                  </div>
                );
              })}
            </Card>
            <span className="text-[11px] leading-[1.45] text-muted">Assumes 6% inflation, 9% blended returns, the car losing 15% a year, salary +8% a year. Estimates, not promises. Meera checks the assumptions before anything becomes a plan.</span>
          </div>
        </div>
      </Screen>
      <Footer>
        <Button href="/decision/car-1">
          Make this my plan <ArrowRightIcon size={18} />
        </Button>
        <div className="flex gap-2">
          <Button href="/ask" variant="secondary" size="md" className="flex-1 text-[13px]">Ask Meera about this</Button>
          <Button href="/scenarios" variant="ghost" size="md" className="flex-1 text-[13px]">Try another</Button>
        </div>
      </Footer>

      <Drawer open={edit} onClose={() => setEdit(false)} eyebrow="Buy a car" title="Change the numbers" height={560} footer={<Button onClick={() => setEdit(false)} size="md">Done</Button>}>
        <div className="flex flex-col gap-2">
          <label htmlFor="price" className="text-[13px] font-bold">On-road price</label>
          <MoneyInput id="price" value={input.price} onChange={(n) => setInput({ ...input, price: n, down: Math.min(input.down, n) })} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="down" className="text-[13px] font-bold">Down payment</label>
          <MoneyInput id="down" value={input.down} onChange={(n) => setInput({ ...input, down: Math.min(n, input.price) })} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold">Loan tenure</span>
          <OptionGroup value={String(input.years)} onChange={(v) => setInput({ ...input, years: Number(v) })} options={[{ value: "3", label: "3 yrs" }, { value: "5", label: "5 yrs" }, { value: "7", label: "7 yrs" }]} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="run" className="text-[13px] font-bold">Running costs a month</label>
          <MoneyInput id="run" value={input.running} onChange={(n) => setInput({ ...input, running: n })} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold">When</span>
          <OptionGroup value={String(input.startYear)} onChange={(v) => setInput({ ...input, startYear: Number(v) })} options={[{ value: "2026", label: "Now" }, { value: "2027", label: "2027" }, { value: "2028", label: "2028" }, { value: "2029", label: "2029" }, { value: "2032", label: "2032" }]} />
        </div>
      </Drawer>
    </>
  );
}

function ym(d: { year: number; month: number }) {
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.month - 1]} ${d.year}`;
}

function InputRow({ label, sub, value, onClick, last }: { label: string; sub?: string; value: string; onClick: () => void; last?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cx("flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2.5 text-left", !last && "border-b border-sunken")}>
      <span className="flex-1 text-[13px] font-semibold">
        {label}
        {sub && <span className="font-medium text-muted"> · {sub}</span>}
      </span>
      <span className="text-[14px] font-bold">{value}</span>
      <ChevronRightIcon size={16} className="text-faint" />
    </button>
  );
}

function CmpRow({ label, a, b, tone, last }: { label: string; a: string; b: string; tone: "attn" | "accent"; last?: boolean }) {
  return (
    <div className={cx("grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 px-3.5 py-2.5 text-[13px]", !last && "border-b border-sunken")}>
      <span className="font-semibold">{label}</span>
      <span className="text-right text-muted">{a}</span>
      <span className={cx("text-right font-bold", tone === "attn" ? "text-attn-text" : "text-accent")}>{b}</span>
    </div>
  );
}

function PathChart({ a, b }: { a: number[]; b: number[] }) {
  const w = 350, h = 140, x0 = 10, x1 = 330, yTop = 15, yBottom = 130;
  const lo = Math.min(...a, ...b) * 0.9, hi = Math.max(...a, ...b) * 1.02;
  const sx = (i: number) => x0 + (i * (x1 - x0)) / (a.length - 1);
  const sy = (v: number) => yBottom - ((v - lo) / (hi - lo)) * (yBottom - yTop);
  const pts = (arr: number[]) => arr.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  const lakh = (v: number) => Math.round(v / 100000);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none" role="img" aria-label="Net worth over the next ten years under both plans">
      {[yBottom, (yTop + yBottom) / 2, yTop].map((y) => (
        <line key={y} x1={x0} y1={y} x2={x1} y2={y} stroke="#EEEBE3" />
      ))}
      <polyline points={pts(a)} stroke="#0E6B55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts(b)} stroke="#B4540A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x={x1 + 4} y={sy(a[a.length - 1]) + 4} fontSize="10" fill="#0E6B55" fontWeight="700">{lakh(a[a.length - 1])}</text>
      <text x={x1 + 4} y={sy(b[b.length - 1]) + 12} fontSize="10" fill="#B4540A" fontWeight="700">{lakh(b[b.length - 1])}</text>
      <text x={x0} y={h - 2} fontSize="10" fill="#8A948F">2026</text>
      <text x={x1} y={h - 2} fontSize="10" fill="#8A948F" textAnchor="end">2036</text>
    </svg>
  );
}
