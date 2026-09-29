"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, ClockIcon, GlobeIcon, GradIcon, HomeIcon, PencilIcon, PlusIcon, ShieldIcon } from "@/components/icons";
import { Button, Card, Eyebrow, Footer, H1, OptionGroup, Screen, TopBar, cx } from "@/components/ui";
import { inr, inrFull, monthYear } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useGoals } from "@/lib/useGoals";
import { AskDrawer, SheetDrawer, type GoalId } from "./GoalDrawers";

type Pick = GoalId | "education" | "travel" | "custom";

/** 4 · Goals, sized in ₹ */
export default function Goals() {
  const router = useRouter();
  const ob = useStore((s) => s.onboarding);
  const set = useStore((s) => s.setOnboarding);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const track = useStore((s) => s.track);
  const goals = useGoals();
  const [ask, setAsk] = useState(false);
  const [sheet, setSheet] = useState<GoalId | null>(null);

  const picked = (g: Pick) => ob.goalsPicked.includes(g);
  function tap(g: Pick) {
    if (picked(g)) {
      if (g === "emergency" || g === "home" || g === "retire") setAsk(true);
      else set({ goalsPicked: ob.goalsPicked.filter((x) => x !== g) });
    } else {
      set({ goalsPicked: [...ob.goalsPicked, g] });
      track("goal_picked", { goal: g });
      if (g === "emergency" || g === "home" || g === "retire") setAsk(true);
    }
  }
  const remove = (g: GoalId) => set({ goalsPicked: ob.goalsPicked.filter((x) => x !== g) });

  const cards: Array<{ id: Pick; name: string; sub: string; icon: React.ReactNode; dashed?: boolean }> = [
    { id: "emergency", name: "Emergency fund", sub: `${inr(goals.emergency.target)} · ${goals.emergency.months} months of expenses`, icon: <ShieldIcon size={20} /> },
    { id: "home", name: "Bigger home", sub: `${inr(goals.home.total)} upfront · ${ob.home.year}`, icon: <HomeIcon size={20} /> },
    { id: "retire", name: "Retire well", sub: `${inr(goals.retire.corpusToday)} · age ${ob.retire.retireAt}, ${goals.retire.year}`, icon: <ClockIcon size={20} /> },
    { id: "education", name: "Child's education", sub: "Set a year later", icon: <GradIcon size={20} /> },
    { id: "travel", name: "Travel", sub: "Yearly budget", icon: <GlobeIcon size={20} /> },
    { id: "custom", name: "Something else", sub: "Describe it in your words", icon: <PlusIcon size={20} />, dashed: true },
  ];

  const sized: Array<{ id: GoalId; name: string; how: string; amount: string; by: string }> = [];
  if (picked("emergency")) sized.push({ id: "emergency", name: "Emergency fund", how: goals.emergency.derivation, amount: inr(goals.emergency.target), by: `by ${monthYear(`${goals.emergency.reach.year}-${String(goals.emergency.reach.month).padStart(2, "0")}-01`)}` });
  if (picked("home")) sized.push({ id: "home", name: "Bigger home", how: `Upfront cash on a ${inr(ob.home.budgetToday)} home, at ${ob.home.year} prices`, amount: inr(goals.home.total), by: `by ${ob.home.year}` });
  if (picked("retire")) sized.push({ id: "retire", name: "Retire well", how: `Today's spending minus the EMI, 6% inflation, to age 90`, amount: inr(goals.retire.corpusToday), by: `by ${goals.retire.year}` });

  const monthlyAll = (picked("emergency") ? goals.emergency.sip : 0) + (picked("home") ? goals.home.sip : 0) + (picked("retire") ? goals.retire.sip : 0);

  return (
    <>
      <TopBar back="/about" label="Step 3 of 3" />
      <Screen>
        <div className="flex flex-col gap-[22px] px-6 pb-6 pt-2">
          <div className="flex flex-col gap-2.5">
            <H1>What is the money for?</H1>
            <p className="text-[15px] leading-[1.5] text-ink-2">Pick what matters. We&apos;ve sized each one from your income, expenses and family; change any number.</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {cards.map((c) => {
              const on = picked(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => tap(c.id)}
                  className={cx(
                    "flex min-h-24 flex-col items-start gap-2 rounded-card p-3.5 text-left",
                    on ? "border-2 border-accent bg-accent-soft" : c.dashed ? "border border-dashed border-line-3 bg-surface" : "border border-line bg-surface"
                  )}
                >
                  <span className={on ? "text-accent" : "text-muted"}>{c.icon}</span>
                  <span className="text-[14px] font-bold">{c.name}</span>
                  <span className={cx("text-[12px]", on ? "text-ink-2" : "text-muted")}>{c.sub}</span>
                </button>
              );
            })}
          </div>

          {sized.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <Eyebrow>Size your goals</Eyebrow>
              <Card padded={false}>
                {sized.map((s, i) => (
                  <div key={s.id} className={cx("flex items-center gap-3 px-3.5 py-3", i < sized.length - 1 && "border-b border-sunken")}>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[13px] font-bold">{s.name}</span>
                      <span className="text-[12px] text-muted">{s.how}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-display text-[18px]">{s.amount}</span>
                      <span className="text-[11px] text-muted">{s.by}</span>
                    </div>
                    <button type="button" aria-label={`How we sized ${s.name}`} onClick={() => setSheet(s.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line-2 bg-surface text-ink">
                      <PencilIcon size={16} />
                    </button>
                  </div>
                ))}
              </Card>
              <span className="text-[12px] leading-[1.45] text-muted">
                {inrFull(monthlyAll)} a month covers {sized.length === 1 ? "it" : `all ${sized.length}`}, out of {inrFull(goals.surplus)} you have spare. Your wealth manager confirms the split before anything is set up.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold text-ink-2">If your portfolio dropped 20% in a month, you would…</span>
            <OptionGroup value={ob.risk} onChange={(v) => set({ risk: v })} options={[{ value: "sell", label: "Sell some" }, { value: "hold", label: "Hold" }, { value: "buy", label: "Buy more" }]} />
          </div>
        </div>
      </Screen>
      <Footer>
        <Button
          onClick={() => {
            setOnboarded();
            track("onboarding_done", { goals: ob.goalsPicked.join(",") });
            router.push("/home");
          }}
        >
          Build my plan <ArrowRightIcon size={18} />
        </Button>
      </Footer>

      <AskDrawer open={ask} onClose={() => setAsk(false)} goals={goals} onRemove={(g) => { remove(g); }} />
      <SheetDrawer goal={sheet} onClose={() => setSheet(null)} onEdit={() => { setSheet(null); setAsk(true); }} goals={goals} />
    </>
  );
}
