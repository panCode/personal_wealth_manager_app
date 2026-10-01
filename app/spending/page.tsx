"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { MoneyInput } from "@/components/inputs";
import { Button, Card, Chip, Screen, SectionTitle, TopBar, cx } from "@/components/ui";
import { inr, inrFull } from "@/lib/format";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

const sp = persona.spending;
const LABELS = ["Household", "Lifestyle", "Gift", "Family support"];

/** 14 · Spending: from statements, labelled by you */
export default function Spending() {
  const labels = useStore((s) => s.labels);
  const label = useStore((s) => s.label);
  const extras = useStore((s) => s.extraSpends);
  const addSpend = useStore((s) => s.addSpend);
  const [customFor, setCustomFor] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [amt, setAmt] = useState(0);
  const [what, setWhat] = useState("");
  const [source, setSource] = useState<"cash" | "other-account">("cash");
  const [recurring, setRecurring] = useState(false);
  const [month, setMonth] = useState<"Aug" | "Sep">("Sep");

  const extraTotal = extras.reduce((s, e) => s + e.amount, 0);
  const total = sp.total + extraTotal;
  const unlabelled = sp.unlabelled.filter((u) => !labels[u.id]);
  const labelledSum = sp.unlabelled.filter((u) => labels[u.id]).reduce((s, u) => s + u.amount, 0);
  const categories = sp.categories.map((c) => ({ ...c, amount: c.key === "other" ? c.amount - labelledSum : c.amount + sp.unlabelled.filter((u) => labels[u.id] === (c.key === "household" ? "Household" : c.key === "lifestyle" ? "Lifestyle" : "—")).reduce((s, u) => s + u.amount, 0) }));
  const diff = Math.round(((total - sp.usual) / sp.usual) * 100);

  function submitSpend() {
    if (!amt || !what.trim()) return;
    addSpend({ amount: amt, what: what.trim(), source, recurring });
    setAmt(0);
    setWhat("");
    setRecurring(false);
  }

  return (
    <>
      <TopBar
        back="/home"
        right={
          <div className="flex gap-1.5">
            <Chip size="sm" selected={month === "Aug"} onClick={() => setMonth("Aug")}>Aug</Chip>
            <Chip size="sm" selected={month === "Sep"} onClick={() => setMonth("Sep")}>Sep</Chip>
          </div>
        }
      />
      <Screen>
        <div className="flex flex-col gap-4 px-5 pb-4 pt-1">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[26px]">Spending</h1>
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-[32px]">{inrFull(month === "Sep" ? total : sp.history[1].total)}</span>
              <span className={cx("text-[13px] font-bold", (month === "Sep" ? diff : -2) <= 0 ? "text-accent" : "text-attn-text")}>
                {month === "Sep" ? `${Math.abs(diff)}% ${diff <= 0 ? "under" : "over"} your usual ${inrFull(sp.usual)}` : `2% under your usual ${inrFull(sp.usual)}`}
              </span>
            </div>
            <span className="text-[12px] text-muted">HDFC + ICICI statements via Account Aggregator{extras.length ? `, plus ${extras.length} spend${extras.length > 1 ? "s" : ""} you added` : ""}.</span>
          </div>

          <Card className="flex flex-col gap-2.5">
            <div className="flex h-3 overflow-hidden rounded-full bg-sunken">
              {categories.map((c) => (
                <div key={c.key} style={{ width: `${(c.amount / total) * 100}%`, background: c.color }} />
              ))}
              {extraTotal > 0 && <div style={{ width: `${(extraTotal / total) * 100}%`, background: "#B4540A" }} />}
            </div>
            <div className="flex flex-col gap-1.5 text-[13px]">
              {categories.map((c) => (
                <div key={c.key} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                  <span className="flex-1">
                    {c.label}
                    {c.key === "other" && unlabelled.length > 0 && <span className="font-bold text-attn-text"> · {unlabelled.length} unlabelled</span>}
                  </span>
                  <span className="font-bold">{inrFull(c.amount)}</span>
                  <span className={cx("w-12 text-right text-[11px]", c.changeTone === "accent" ? "text-accent" : c.changeTone === "attn" ? "text-attn-text" : "text-muted")}>{c.change}</span>
                </div>
              ))}
              {extraTotal > 0 && (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-attn" />
                  <span className="flex-1">Added by you</span>
                  <span className="font-bold">{inrFull(extraTotal)}</span>
                  <span className="w-12 text-right text-[11px] text-muted">new</span>
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-2.5">
            <SectionTitle action={<span className="text-[12px] text-muted">{unlabelled.length ? `${inrFull(unlabelled.reduce((s, u) => s + u.amount, 0))} · ${unlabelled.length} spend${unlabelled.length > 1 ? "s" : ""}` : "all labelled"}</span>}>Help us label these</SectionTitle>
            {unlabelled.length === 0 ? (
              <Card className="text-[13px] text-muted">Nothing left to label this month. We remember every payee you tagged.</Card>
            ) : (
              <Card padded={false}>
                {unlabelled.map((u, i) => (
                  <div key={u.id} className={cx("flex flex-col gap-2 px-3.5 py-3", i < unlabelled.length - 1 && "border-b border-sunken")}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] font-bold">{u.payee}</span>
                      <span className="text-[13px] font-bold">{inrFull(u.amount)}</span>
                    </div>
                    <span className="text-[12px] text-muted">{u.meta}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {LABELS.map((l) => (
                        <Chip key={l} size="sm" onClick={() => label(u.id, l)}>{l}</Chip>
                      ))}
                      {customFor === u.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (custom.trim()) label(u.id, custom.trim());
                            setCustomFor(null);
                            setCustom("");
                          }}
                          className="flex gap-1.5"
                        >
                          <input autoFocus value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Your label" className="h-8 w-28 rounded-full border border-line-2 bg-surface px-3 text-[16px] outline-none" />
                          <button type="submit" className="h-8 rounded-full bg-accent px-3 text-[12px] font-bold text-white">Save</button>
                        </form>
                      ) : (
                        <button type="button" onClick={() => setCustomFor(u.id)} className="h-8 rounded-full border border-dashed border-line-3 bg-surface px-3 text-[12px] font-semibold text-accent">+ Own label</button>
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            )}
            <span className="text-[12px] text-muted">Label once and we remember the payee. Skipping is fine; it stays under &ldquo;Other&rdquo;.</span>
          </div>

          <div className="flex flex-col gap-2.5 rounded-card border border-dashed border-line-3 bg-surface px-4 py-3.5">
            <span className="text-[14px] font-bold">Add a spend we can&apos;t see</span>
            <span className="text-[12px] text-muted">Cash, a card we&apos;re not connected to, or something a family member paid.</span>
            <div className="flex gap-2">
              <MoneyInput id="amt" value={amt} onChange={setAmt} compact />
              <label htmlFor="what" className="sr-only">What was it for</label>
              <input id="what" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="What for, e.g. maid, vegetables" className="h-10 min-w-0 flex-1 rounded-xl border border-line-2 bg-surface px-3 text-[16px] text-ink outline-none" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip size="sm" selected={source === "cash"} onClick={() => setSource("cash")}>Cash</Chip>
              <Chip size="sm" selected={source === "other-account"} onClick={() => setSource("other-account")}>Other account</Chip>
              <Chip size="sm" selected={recurring} onClick={() => setRecurring(!recurring)}>Repeats monthly</Chip>
              <span className="flex-1" />
              <Button size="sm" onClick={submitSpend} className={cx((!amt || !what.trim()) && "opacity-50")}>Add</Button>
            </div>
            {extras.length > 0 && (
              <div className="flex flex-col gap-1 border-t border-sunken pt-2 text-[12px]">
                {extras.map((e) => (
                  <div key={e.id} className="flex justify-between">
                    <span>{e.what}{e.recurring ? " · monthly" : ""} · {e.source === "cash" ? "cash" : "other account"}</span>
                    <span className="font-bold">{inrFull(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <SectionTitle>What your CFO noticed</SectionTitle>
            <Card padded={false}>
              {sp.insights.map((ins, i) => (
                <div key={ins.id} className={cx("flex flex-col gap-1.5 px-3.5 py-3", i < sp.insights.length - 1 && "border-b border-sunken")}>
                  <span className="text-[13px] font-semibold">{ins.title}</span>
                  <span className="text-[12px] text-muted">{ins.sub}</span>
                  {ins.action && <Button href={ins.action.href} size="sm" variant="secondary" className="mt-0.5 self-start border-0 bg-accent-soft">{ins.action.label}</Button>}
                </div>
              ))}
              {extraTotal > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-sunken px-3.5 py-3">
                  <span className="text-[13px] font-semibold">You added {inr(extraTotal)} of spends we couldn&apos;t see.</span>
                  <span className="text-[12px] text-muted">Your real monthly number is closer to {inrFull(total)}; the emergency fund target moves with it.</span>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
