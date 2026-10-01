"use client";

import { useRef } from "react";
import { Drawer } from "@/components/Drawer";
import { MoneyInput } from "@/components/inputs";
import { CheckIcon } from "@/components/icons";
import { Button, Card, Chip, Eyebrow, OptionGroup, cx } from "@/components/ui";
import { inr, inrFull, monthYear } from "@/lib/format";
import { assumptions, type GoalsComputed } from "@/lib/goals";
import { persona } from "@/lib/persona";
import { scrollToWithin } from "@/lib/scroll";
import { useStore } from "@/lib/store";

export type GoalId = "emergency" | "home" | "retire";
const NAMES: Record<GoalId, string> = { emergency: "Emergency fund", home: "Bigger home", retire: "Retire well" };

/* =========================================================================
   4a · The questions we ask, for every goal picked
   ========================================================================= */

export function AskDrawer({ open, onClose, goals, onRemove }: { open: boolean; onClose: () => void; goals: GoalsComputed; onRemove: (g: GoalId) => void }) {
  const ob = useStore((s) => s.onboarding);
  const set = useStore((s) => s.setOnboarding);
  const picked = ob.goalsPicked.filter((g): g is GoalId => g === "emergency" || g === "home" || g === "retire");
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const jump = (id: string) => scrollToWithin(refs.current[id]);
  const unpicked = (["education", "travel", "custom"] as const).filter((g) => !ob.goalsPicked.includes(g));

  return (
    <Drawer open={open} onClose={onClose} eyebrow={`${picked.length} goals picked`} title="A few questions, then we size them" height={760}
      footer={
        <div className="flex flex-col gap-1.5">
          <Button onClick={onClose}>Size my goals</Button>
          <span className="text-center text-[11px] leading-[1.4] text-muted">Price growth, registration, lender rules and inflation we fill in ourselves. Tap any sized goal afterwards to see and change them.</span>
        </div>
      }
    >
      <div className="-mt-1 flex gap-1.5">
        {picked.includes("emergency") && (
          <button type="button" onClick={() => jump("emergency")} className="flex h-[30px] items-center gap-1 rounded-full bg-accent-soft px-2.5 text-[12px] font-bold text-accent"><CheckIcon size={12} strokeWidth={3} /> Emergency</button>
        )}
        {picked.includes("home") && <button type="button" onClick={() => jump("home")} className="h-[30px] rounded-full bg-ink px-2.5 text-[12px] font-bold text-white">Home · 3</button>}
        {picked.includes("retire") && <button type="button" onClick={() => jump("retire")} className="h-[30px] rounded-full border border-line-2 bg-surface px-2.5 text-[12px] font-semibold">Retire · 2</button>}
      </div>

      {picked.includes("emergency") && (
        <Card className="flex flex-col gap-2.5" >
          <div ref={(el) => { refs.current.emergency = el; }} className="flex items-center justify-between">
            <span className="text-[15px] font-bold">Emergency fund</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-accent">Nothing to ask</span>
          </div>
          <span className="text-[13px] leading-[1.45] text-ink-2">
            Sized from what we already know: {inrFull(goals.expenses)} a month of expenses, spouse {ob.household.spouse === "earns" ? "earns" : ob.household.spouse === "none" ? "none" : "doesn't earn"}, {ob.household.children} {ob.household.children === 1 ? "child" : "children"}, {ob.household.parents} parent{ob.household.parents === 1 ? "" : "s"} supported. That says {goals.emergency.months} months.
          </span>
          <div className="flex flex-col gap-2 border-t border-sunken pt-2">
            <span className="text-[13px] font-bold">Optional: how steady is your income?</span>
            <OptionGroup value={ob.household.incomeSteady} onChange={(v) => set({ household: { ...ob.household, incomeSteady: v } })} options={[{ value: "steady", label: "Steady" }, { value: "variable", label: "Variable" }, { value: "uncertain", label: "Uncertain" }]} />
            <span className="text-[12px] text-muted">Variable or uncertain adds 3 months.</span>
          </div>
          <RemoveGoal onClick={() => onRemove("emergency")} />
        </Card>
      )}

      {picked.includes("home") && (
        <Card className="flex flex-col gap-3.5 border-2 border-ink">
          <div ref={(el) => { refs.current.home = el; }} className="flex items-center justify-between">
            <span className="text-[15px] font-bold">Bigger home</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">3 questions</span>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="budget" className="text-[13px] font-bold">Roughly what would it cost today?</label>
            <MoneyInput id="budget" value={ob.home.budgetToday} onChange={(n) => set({ home: { ...ob.home, budgetToday: n } })} />
            <div className="flex flex-wrap gap-1.5">
              <Chip size="sm" tone="sunken" onClick={() => set({ home: { ...ob.home, budgetToday: 8_500_000 } })}>2BHK Whitefield ≈ ₹85L</Chip>
              <Chip size="sm" tone="sunken" onClick={() => set({ home: { ...ob.home, budgetToday: 13_000_000 } })}>3BHK HSR ≈ ₹1.3 Cr</Chip>
              <Chip size="sm" tone="sunken" onClick={() => set({ home: { ...ob.home, budgetToday: 10_000_000 } })}>Estimate for me</Chip>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold">When do you want to move in?</span>
            <OptionGroup value={String(ob.home.year)} onChange={(v) => set({ home: { ...ob.home, year: Number(v) } })} options={[{ value: "2029", label: "2029" }, { value: "2031", label: "2031" }, { value: "2033", label: "2033" }, { value: "2036", label: "Later" }]} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold">Will you sell your current flat?</span>
            <OptionGroup value={ob.home.sellFlat} onChange={(v) => set({ home: { ...ob.home, sellFlat: v } })} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No, keep it" }, { value: "unsure", label: "Not sure" }]} />
            <span className="text-[12px] text-muted">Changes how big a loan you&apos;ll need. &ldquo;Not sure&rdquo; is fine.</span>
          </div>
          <RemoveGoal onClick={() => onRemove("home")} />
        </Card>
      )}

      {picked.includes("retire") && (
        <Card className="flex flex-col gap-3.5">
          <div ref={(el) => { refs.current.retire = el; }} className="flex items-center justify-between">
            <span className="text-[15px] font-bold">Retire well</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-muted">2 questions</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold">Retire at what age? <span className="font-medium text-muted">You&apos;re {persona.age}, from your KYC.</span></span>
            <OptionGroup value={String(ob.retire.retireAt)} onChange={(v) => set({ retire: { ...ob.retire, retireAt: Number(v) } })} options={[{ value: "50", label: "50" }, { value: "55", label: "55" }, { value: "60", label: "60" }, { value: "65", label: "65" }]} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold">Life after that, compared with today?</span>
            <OptionGroup value={ob.retire.lifestyle} onChange={(v) => set({ retire: { ...ob.retire, lifestyle: v } })} options={[{ value: "simpler", label: "Simpler" }, { value: "same", label: "Same" }, { value: "more", label: "More comfortable" }]} />
            <span className="text-[12px] text-muted">&ldquo;Same&rdquo; means today&apos;s spending minus the EMI that ends, plus {inr(assumptions.healthAndUpkeepInRetirement, { compact: false })} a month for health and upkeep, grown with inflation.</span>
          </div>
          <RemoveGoal onClick={() => onRemove("retire")} />
        </Card>
      )}

      {unpicked.length > 0 && (
        <div className="flex flex-col gap-1 rounded-xl bg-sunken px-3.5 py-3 text-ink-2">
          <span className="text-[12px] font-bold">Not picked, so not asked</span>
          <span className="text-[12px] leading-[1.45]">Child&apos;s education would ask the child&apos;s age and the path (India or abroad). Travel asks a yearly budget. &ldquo;Something else&rdquo; asks an amount and a year.</span>
        </div>
      )}
    </Drawer>
  );
}

function RemoveGoal({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="self-start text-[12px] font-bold text-muted">Remove this goal</button>
  );
}

/* =========================================================================
   4b · How we sized this
   ========================================================================= */

export function SheetDrawer({ goal, onClose, onEdit, goals }: { goal: GoalId | null; onClose: () => void; onEdit: () => void; goals: GoalsComputed }) {
  const ob = useStore((s) => s.onboarding);
  const open = goal !== null;
  const g = goal ?? "home";

  let headline: React.ReactNode = null;
  let words = "";
  let inputs: Array<{ label: string; value: string; source: "told" | "bank" | "assumed" | "rule"; edit?: boolean }> = [];
  let maths: Array<{ label: string; value: string }> = [];
  let check: React.ReactNode = null;
  let total = "";

  if (g === "home") {
    const h = goals.home;
    headline = <>by {ob.home.year}<br />≈ {inrFull(Math.round(h.needed / 100) * 100)} a month from now</>;
    total = inr(h.total);
    words = `A ${inr(ob.home.budgetToday)} home today costs about ${inr(h.priceThen)} in ${ob.home.year} at ${Math.round(assumptions.propertyGrowth * 100)}% a year. Banks lend 80%, so you bring 20%, plus registration, which no bank funds, plus a little for interiors.`;
    inputs = [
      { label: "Home budget, today's price", value: inr(ob.home.budgetToday), source: "told", edit: true },
      { label: "When", value: String(ob.home.year), source: "told", edit: true },
      { label: "Property prices rise by", value: `${Math.round(assumptions.propertyGrowth * 100)}% / yr`, source: "assumed" },
      { label: "Down payment", value: `${assumptions.downPaymentPct * 100}%`, source: "rule" },
      { label: "Stamp duty & registration", value: `~${Math.round(assumptions.stampDutyPct * 100)}%`, source: "rule" },
      { label: "Interiors & moving buffer", value: inr(assumptions.interiorsBuffer), source: "assumed" },
    ];
    maths = [
      { label: `${inr(ob.home.budgetToday)} × 1.07^${h.years} = price in ${ob.home.year}`, value: inr(h.priceThen) },
      { label: "20% down payment", value: inr(h.down) },
      { label: "Stamp duty & registration, ~7%", value: inr(h.duty) },
      { label: "Interiors & moving", value: inr(h.buffer) },
    ];
    const loan = ob.home.sellFlat === "yes" ? h.loan - 3_300_000 : h.loan;
    const emi = ob.home.sellFlat === "yes" ? h.emi * (loan / h.loan) : h.emi;
    const share = emi / h.incomeThen;
    check =
      share > 0.4 ? (
        <Check tone="attn" title="Worth checking">
          The loan on the remaining {inr(loan)} is about {inrFull(Math.round(emi / 100) * 100)} a month, roughly {Math.round(share * 100)}% of your expected {ob.home.year} income. Our guide is 40%.
          {ob.home.sellFlat === "unsure" ? " Selling the current flat brings it well under; Meera will walk you through both routes." : ob.home.sellFlat === "no" ? " Keeping the current flat means a smaller budget or a later date. Meera will talk it through." : ""}
        </Check>
      ) : (
        <Check tone="accent" title="Looks comfortable">
          The loan on the remaining {inr(loan)} is about {inrFull(Math.round(emi / 100) * 100)} a month, {Math.round(share * 100)}% of your expected {ob.home.year} income, under our 40% guide.
        </Check>
      );
  } else if (g === "emergency") {
    const e = goals.emergency;
    headline = <>{e.months} months of expenses<br />on track for {monthYear(`${e.reach.year}-${String(e.reach.month).padStart(2, "0")}-01`)}</>;
    total = inr(e.target);
    words = `If income stops, this is what keeps the house running while you sort things out. It sits in a liquid fund and a sweep FD, so it earns a little and is out the same day.`;
    inputs = [
      { label: "Monthly expenses", value: inrFull(goals.expenses), source: ob.connections.bank ? "bank" : "told", edit: false },
      { label: "Months of cover", value: `${e.months}`, source: "rule" },
      { label: "Spouse earns", value: ob.household.spouse === "earns" ? "Yes" : "No", source: "told", edit: true },
      { label: "Dependents", value: `${ob.household.children + ob.household.parents}`, source: "told", edit: true },
      { label: "Income steadiness", value: ob.household.incomeSteady, source: "told", edit: true },
    ];
    maths = [
      { label: `${e.months} × ${inrFull(goals.expenses)}`, value: inr(e.months * goals.expenses) },
      { label: "Rounded to", value: inr(e.target) },
      { label: `Already saved`, value: inr(e.saved) },
      { label: `Adding ${inrFull(e.sip)} a month`, value: `reaches ${monthYear(`${e.reach.year}-${String(e.reach.month).padStart(2, "0")}-01`)}` },
    ];
    check = (
      <Check tone="accent" title="The rule behind the months">
        6 months is the base. 9 if you&apos;re the only earner with dependents. 3 more if income is variable or uncertain. Never more than 12: beyond that, the money should be working harder elsewhere.
      </Check>
    );
  } else {
    const r = goals.retire;
    headline = <>in today&apos;s money, by {r.year}<br />{r.shortBy > 0 ? `${inrFull(r.shortBy)} a month short` : "on track"}</>;
    total = inr(r.corpusToday);
    words = `You'd spend about ${inrFull(Math.round(r.spendToday / 100) * 100)} a month in today's money: today's spending minus the EMI that ends, plus health and upkeep. That has to last from ${ob.retire.retireAt} to ${assumptions.planToAge}, growing with inflation the whole way.`;
    inputs = [
      { label: "Retire at", value: `${ob.retire.retireAt}`, source: "told", edit: true },
      { label: "Life after that", value: ob.retire.lifestyle === "same" ? "Same as today" : ob.retire.lifestyle === "simpler" ? "Simpler" : "More comfortable", source: "told", edit: true },
      { label: "Spending today, minus EMI", value: inrFull(goals.expenses - ob.expenses.emi), source: ob.connections.bank ? "bank" : "told" },
      { label: "Health & upkeep from 60", value: `${inrFull(assumptions.healthAndUpkeepInRetirement)} / mo`, source: "assumed" },
      { label: "Inflation", value: `${assumptions.inflation * 100}% / yr`, source: "assumed" },
      { label: "Plan until age", value: `${assumptions.planToAge}`, source: "assumed" },
    ];
    maths = [
      { label: `${r.yearsInRetirement} years of spending, inflation-proofed`, value: `${inr(r.corpusToday)} today` },
      { label: `Same thing in ${r.year} rupees`, value: inr(r.corpusThen) },
      { label: `What ${inr(r.saved)} saved grows to`, value: inr(r.fromSaved) },
      { label: "What EPF grows to", value: inr(r.fromEpf) },
      { label: "Gap the SIP must fill", value: inr(r.gap) },
    ];
    check =
      r.shortBy > 0 ? (
        <Check tone="attn" title="Worth checking">
          That gap needs {inrFull(r.needed)} a month at 10% for {r.yearsToRetire} years. You&apos;re at {inrFull(r.sip)}. The step-up in October closes it.
        </Check>
      ) : (
        <Check tone="accent" title="Looks comfortable">
          That gap needs {inrFull(r.needed)} a month at 10% for {r.yearsToRetire} years. You&apos;re at {inrFull(r.sip)}, so this one is covered.
        </Check>
      );
  }

  return (
    <Drawer open={open} onClose={onClose} eyebrow="How we sized this" title={NAMES[g]}
      footer={
        <div className="flex flex-col gap-1.5">
          <Button onClick={onClose} size="md">Keep {total}{g === "home" ? ` by ${ob.home.year}` : ""}</Button>
          <span className="text-center text-[11px] text-muted">Meera confirms these assumptions on your first call.</span>
        </div>
      }
    >
      <div className="flex items-end justify-between gap-3 rounded-card-lg bg-ink p-4 text-white">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] text-on-dark-muted">{g === "home" ? "Cash you'll need upfront" : g === "emergency" ? "Target" : "Corpus you'll need"}</span>
          <span className="font-display text-[34px] leading-none">{total}</span>
        </div>
        <span className="text-right text-[12px] leading-[1.4] text-on-dark-muted">{headline}</span>
      </div>

      <p className="text-[14px] leading-[1.5]">{words}</p>

      <div className="flex flex-col gap-2">
        <Eyebrow>Inputs, tap to change</Eyebrow>
        <Card padded={false}>
          {inputs.map((row, i) => {
            const tag = row.source === "told" ? "You told us" : row.source === "bank" ? "From bank" : row.source === "rule" ? (g === "home" && row.label.startsWith("Stamp") ? "Karnataka" : g === "home" ? "Lender norm" : "Rule") : "Assumed";
            const tone = row.source === "told" || row.source === "bank" ? "bg-accent-soft text-accent" : "bg-sunken text-ink-2";
            const cls = cx("flex min-h-12 w-full items-center gap-2.5 px-3.5 py-3 text-left", i < inputs.length - 1 && "border-b border-sunken");
            const inner = (
              <>
                <span className="flex-1 text-[13px] font-semibold">{row.label}</span>
                <span className={cx("h-5 rounded-full px-2 text-[10px] font-bold uppercase leading-5 tracking-[0.04em]", tone)}>{tag}</span>
                <span className="min-w-[56px] text-right text-[14px] font-bold">{row.value}</span>
              </>
            );
            return row.edit ? (
              <button key={row.label} type="button" onClick={onEdit} className={cls}>{inner}</button>
            ) : (
              <div key={row.label} className={cls}>{inner}</div>
            );
          })}
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <Eyebrow>The maths</Eyebrow>
        <Card className="flex flex-col gap-2 text-[13px]">
          {maths.map((m) => (
            <div key={m.label} className="flex justify-between gap-2.5">
              <span className="text-ink-2">{m.label}</span>
              <span className="whitespace-nowrap font-bold">{m.value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-2.5 border-t border-sunken pt-2">
            <span className="font-bold">{g === "home" ? "Upfront cash" : g === "emergency" ? "Target" : "In today's money"}</span>
            <span className="font-display text-[18px]">{total}</span>
          </div>
        </Card>
      </div>

      {check}
    </Drawer>
  );
}

function Check({ tone, title, children }: { tone: "attn" | "accent"; title: string; children: React.ReactNode }) {
  return (
    <div className={cx("flex flex-col gap-1.5 rounded-card border p-3.5", tone === "attn" ? "border-attn-line bg-attn-soft" : "border-accent-pale bg-accent-soft")}>
      <span className={cx("flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em]", tone === "attn" ? "text-attn-text" : "text-accent")}>
        <span className={cx("h-2 w-2 rounded-full", tone === "attn" ? "bg-attn" : "bg-accent")} />
        {title}
      </span>
      <span className="text-[13px] leading-[1.45]">{children}</span>
    </div>
  );
}
