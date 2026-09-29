"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { Button, Card, Eyebrow, Footer, H1, Note, Screen, TopBar, cx } from "@/components/ui";
import { inrFull } from "@/lib/format";
import { MoneyInput } from "@/components/inputs";
import { useStore } from "@/lib/store";

/** 3 · About you. Bank connected: income and expenses pre-filled. Not connected: self-reported. */
export default function About() {
  const ob = useStore((s) => s.onboarding);
  const setOnboarding = useStore((s) => s.setOnboarding);
  const bank = ob.connections.bank;
  const [editIncome, setEditIncome] = useState(false);
  const [editExpenses, setEditExpenses] = useState(false);

  const expenses = ob.expenses.emi + ob.expenses.household + ob.expenses.rest;
  const surplus = ob.income - expenses;
  const hh = ob.household;
  const setHH = (patch: Partial<typeof hh>) => setOnboarding({ household: { ...hh, ...patch } });

  return (
    <>
      <TopBar back="/connect" label="Step 2 of 3" />
      <Screen>
        <div className="flex flex-col gap-5 px-6 pb-6 pt-2">
          <div className="flex flex-col gap-2.5">
            <H1>Tell us about your household</H1>
            <p className="text-[15px] leading-[1.5] text-ink-2">
              {bank ? "We've filled in what your bank shows. Correct anything that's off." : "Rough numbers are fine. We refine them as SIPs, bills and salary show up."}
            </p>
          </div>

          {!bank && (
            <div className="flex items-center gap-3 rounded-xl border border-attn-line bg-attn-soft px-3.5 py-3">
              <span className="flex-1 text-[12px] leading-[1.45]">No bank connected, so income and spending are self-reported. Estimates carry a wider margin until you connect one.</span>
              <Link href="/connect" className="flex h-[34px] shrink-0 items-center rounded-[9px] bg-ink px-3 text-[12px] font-bold text-white">Connect</Link>
            </div>
          )}

          {/* Household */}
          <div className="flex flex-col gap-2.5">
            <Eyebrow>Who depends on you</Eyebrow>
            <Card className="flex flex-col gap-2 px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold">Spouse</span>
                <div className="flex gap-1.5">
                  {(["earns", "not-earning", "none"] as const).map((v) => (
                    <Mini key={v} on={hh.spouse === v} onClick={() => setHH({ spouse: v })}>{v === "earns" ? "Earns" : v === "not-earning" ? "Doesn't earn" : "None"}</Mini>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-sunken pt-2">
                <span className="text-[14px] font-semibold">Children</span>
                <Stepper value={hh.children} onChange={(n) => setHH({ children: n })} label="children" />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-sunken pt-2">
                <span className="text-[14px] font-semibold">Parents you support</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((n) => (
                    <Mini key={n} on={hh.parents === n} onClick={() => setHH({ parents: n })}>{n}</Mini>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Income */}
          <div className="flex flex-col gap-2.5">
            <Eyebrow>Income</Eyebrow>
            <Card className="flex flex-col gap-2.5 px-4 py-3.5">
              {bank && !editIncome ? (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display text-[26px]">
                      {inrFull(ob.income)}<span className="font-sans text-[13px] text-muted"> / month</span>
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-muted"><CheckIcon size={14} className="text-accent" /> Salary credits · HDFC · last 6 months</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-ink" onClick={() => setEditIncome(true)}>Edit</Button>
                </div>
              ) : (
                <>
                  <label htmlFor="inc" className="text-[13px] font-semibold text-ink-2">Monthly take-home, after tax</label>
                  <MoneyInput id="inc" value={ob.income} onChange={(n) => setOnboarding({ income: n })} />
                  {!bank && <span className="text-[12px] text-muted">Or upload a salary slip or Form 16 and we read it.</span>}
                </>
              )}
              <div className="flex items-center justify-between border-t border-sunken pt-2">
                <span className="text-[13px] text-ink-2">Other income (rent, freelance, dividends)</span>
                <button type="button" className="text-[13px] font-bold text-accent">+ Add</button>
              </div>
            </Card>
          </div>

          {/* Expenses */}
          <div className="flex flex-col gap-2.5">
            <Eyebrow>{bank ? "Expenses" : "Expenses, three quick questions"}</Eyebrow>
            <Card className="flex flex-col gap-2.5 px-4 py-3.5">
              {bank && !editExpenses ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display text-[26px]">
                        {inrFull(expenses)}<span className="font-sans text-[13px] text-muted"> / month</span>
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-muted"><CheckIcon size={14} className="text-accent" /> Average of 6 months, both accounts</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-ink" onClick={() => setEditExpenses(true)}>Edit</Button>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-sunken">
                    <div style={{ width: `${(ob.expenses.emi / expenses) * 100}%` }} className="bg-ink" />
                    <div style={{ width: `${(ob.expenses.household / expenses) * 100}%` }} className="bg-accent" />
                    <div style={{ width: `${(ob.expenses.rest / expenses) * 100}%` }} className="bg-accent-mid" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
                    <Legend color="bg-ink" label={`EMI ${inrFull(ob.expenses.emi)}`} />
                    <Legend color="bg-accent" label={`Household ${inrFull(ob.expenses.household)}`} />
                    <Legend color="bg-accent-mid" label={`Lifestyle & other ${inrFull(ob.expenses.rest)}`} />
                  </div>
                </>
              ) : (
                <>
                  <QRow id="emi" label="Rent or EMIs" value={ob.expenses.emi} onChange={(n) => setOnboarding({ expenses: { ...ob.expenses, emi: n } })} />
                  <QRow id="hh" label="Household, bills, school" value={ob.expenses.household} onChange={(n) => setOnboarding({ expenses: { ...ob.expenses, household: n } })} />
                  <QRow id="rest" label="Everything else, roughly" value={ob.expenses.rest} onChange={(n) => setOnboarding({ expenses: { ...ob.expenses, rest: n } })} />
                  {!bank && <span className="text-[12px] text-muted">Not sure? Families like yours in Bengaluru spend about ₹15–20k here. We'll tighten this from your UPI and card statements later.</span>}
                </>
              )}
              <div className="flex items-center justify-between border-t border-sunken pt-2">
                <span className="text-[13px] text-ink-2">Cash or spends from other accounts</span>
                <button type="button" className="text-[13px] font-bold text-accent">+ Add</button>
              </div>
            </Card>
          </div>

          <div className="flex items-center gap-3 rounded-card bg-ink px-4 py-3.5 text-white">
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[12px] text-on-dark-muted">Left for goals each month{bank ? "" : ", estimate"}</span>
              <span className="font-display text-[26px]">{bank ? "" : "≈ "}{inrFull(surplus)}</span>
            </div>
            <span className="max-w-[140px] text-right text-[12px] text-on-dark-muted">
              {bank ? `Income ${inrFull(ob.income)} − expenses ${inrFull(expenses)}` : "We'll ask you to confirm this after the first month"}
            </span>
          </div>

          {surplus < 10_000 && <Note tone="attn">That leaves very little for goals. That's fine to start; the plan will be about protection first, growth later.</Note>}
        </div>
      </Screen>
      <Footer>
        <Button href="/goals">
          {bank ? "Looks right, continue" : "Continue"} <ArrowRightIcon size={18} />
        </Button>
      </Footer>
    </>
  );
}

function Mini({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cx("h-[34px] rounded-full px-3 text-[12px]", on ? "border-2 border-accent bg-accent-soft font-bold" : "border border-line-2 bg-surface font-semibold")}>
      {children}
    </button>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <button type="button" aria-label={`Fewer ${label}`} onClick={() => onChange(Math.max(0, value - 1))} className="h-[34px] w-[34px] rounded-full border border-line-2 bg-surface text-[16px] font-bold">−</button>
      <span className="w-5 text-center text-[15px] font-bold">{value}</span>
      <button type="button" aria-label={`More ${label}`} onClick={() => onChange(Math.min(6, value + 1))} className="h-[34px] w-[34px] rounded-full border border-line-2 bg-surface text-[16px] font-bold">+</button>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cx("h-2 w-2 rounded-[2px]", color)} />
      {label}
    </span>
  );
}

function QRow({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <label htmlFor={id} className="text-[13px] font-semibold">{label}</label>
      <MoneyInput id={id} value={value} onChange={onChange} compact />
    </div>
  );
}
