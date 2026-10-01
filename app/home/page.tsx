"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CountUp } from "@/components/CountUp";
import { ArrowRightIcon, ChevronRightIcon, GearIcon, SendIcon } from "@/components/icons";
import { SkyBand } from "@/components/SkyBand";
import { Avatar, Screen, cx } from "@/components/ui";
import { answers } from "@/lib/answers";
import { inrLike } from "@/lib/format";
import { nextCheckIn, oneThing, verdict, whatMoved } from "@/lib/home";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";
import { useGoals } from "@/lib/useGoals";

const p = persona;

/** Chips under the Ask box: the three questions this user is most likely to have. */
const CHIP_IDS = ["prepay", "insurance", "spending"];

/**
 * 5 · Home, v2 (docs/home-v2.md). Four blocks: the sky band with the one
 * number and its verdict; the one thing that needs the user, or the calm
 * state; what moved this month; and Ask. Nothing that stands still.
 */
export default function Home() {
  const live = useStore((s) => s.decisions);
  const ob = useStore((s) => s.onboarding);
  const hydrated = useStore((s) => s.hydrated);
  const goals = useGoals();

  const thing = oneThing(live);
  const v = verdict(goals, ob, live);
  const moved = whatMoved(live, ob);

  return (
    <>
      <Screen>
        {/* 1 · Sky band */}
        <SkyBand className="pb-12">
          <div className="safe-top flex flex-col px-5">
            <div className="flex justify-end">
              <Link href="/settings" aria-label="Prototype settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-current">
                <GearIcon size={18} />
              </Link>
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="sr-only">Net worth</span>
              <CountUp value={p.netWorth.total} format={inrLike(p.netWorth.total)} className="font-display display-soft text-[52px] leading-none" />
              <span className="text-[16px] leading-[1.4]">
                {v.moved} <strong className="font-bold">{v.meaning}</strong>
              </span>
            </div>
            <Sparkline points={p.sparkline} className={cx("mt-3", hydrated ? "opacity-100" : "opacity-0")} />
          </div>
        </SkyBand>

        <div className="flex flex-col gap-4 px-5 pb-5 pt-0.5">
          {/* 2 · One thing, or the calm state */}
          {thing ? (
            <Link href={`/decision/${thing.id}`} className="flex flex-col gap-2 rounded-card-lg bg-ochre-soft p-4 text-ink" aria-label={`One thing this week: ${thing.summary}`}>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-ochre" />
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ochre-text">One thing this week</span>
              </span>
              <span className="font-display text-[19px] leading-[1.3]">{thing.summary}</span>
              <span className="flex items-center justify-between pt-1">
                <span className="text-[13px] text-muted">{p.wealthManager.name.split(" ")[0]} reviewed · {thing.takes}</span>
                <span className="flex h-[38px] items-center gap-1.5 rounded-[12px] bg-ink px-4 text-[13px] font-bold text-ground">
                  Look <ArrowRightIcon size={16} strokeWidth={2.2} />
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex flex-col gap-2 rounded-card-lg bg-surface px-[18px] py-5">
              <span className="font-display text-[21px] leading-[1.25]">Nothing needs you this week.</span>
              <span className="text-[14px] leading-[1.5] text-ink-2">Your money is doing its job. I check in again on {nextCheckIn()}, or sooner if something changes.</span>
              <span className="flex items-center gap-2 pt-1">
                <Avatar initials={p.wealthManager.initials} size={26} />
                <span className="text-[13px] text-muted">{p.wealthManager.name.split(" ")[0]}, your wealth manager</span>
              </span>
            </div>
          )}

          {/* 3 · What moved */}
          <section className="flex flex-col gap-2" aria-label="What moved this month">
            <span className="pl-1 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">What moved</span>
            {moved.length ? (
              <div className="flex flex-col overflow-hidden rounded-card-lg bg-surface">
                {moved.map((r, i) => (
                  <Link key={r.key} href={r.href} className={cx("flex min-h-[54px] items-center gap-3 px-4 py-2 text-ink", i < moved.length - 1 && "border-b border-line")}>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{r.label}</span>
                      <span className="text-[13px] text-muted">{r.sub}</span>
                    </span>
                    <span className="font-display text-[17px] font-semibold">{r.value}</span>
                    <ChevronRightIcon size={16} className="text-faint" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-card-lg bg-surface px-4 py-3.5 text-[14px] text-ink-2">Quiet month. Nothing moved more than usual.</div>
            )}
          </section>

          {/* 4 · Ask */}
          <AskBlock />

          <span className="pb-1 pt-1 text-center text-[12px] text-faint">
            Prototype with a demo account · <Link href="/settings" className="font-bold text-accent">Start over</Link>
          </span>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}

function AskBlock() {
  const router = useRouter();
  const track = useStore((s) => s.track);
  const [text, setText] = useState("");
  const chips = CHIP_IDS.map((id) => answers.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a);

  function submit(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    track("home_ask", { q: t });
    router.push(`/ask?text=${encodeURIComponent(t)}`);
  }

  return (
    <section className="flex flex-col gap-2.5" aria-label="Ask your CFO">
      <label htmlFor="home-ask" className="pl-1 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Ask your CFO</label>
      <form onSubmit={submit} className="flex h-[52px] items-center gap-2 rounded-[18px] bg-surface pl-[18px] pr-2">
        <input
          id="home-ask"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask anything about your money"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
        />
        <button type="submit" aria-label="Send" className="flex h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-accent text-ground">
          <SendIcon size={18} />
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {chips.map((a) => (
          <Link key={a.id} href={`/ask?q=${a.id}`} className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-surface px-3.5 text-[13px] font-semibold text-ink">
            {a.question}
          </Link>
        ))}
      </div>
      <Link href="/ask" className="pl-1 text-[13px] text-muted">
        What people like you asked this week →
      </Link>
    </section>
  );
}

/** Twelve months, one line, no axes, never red. */
function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const w = 350;
  const h = 40;
  const step = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(y + 4).toFixed(1)}`).join(" ");
  const last = points[points.length - 1] + 4;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" fill="none" aria-hidden="true" className={cx("transition-opacity duration-500", className)}>
      <path d={d} stroke="var(--sky-line)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={w} cy={last} r={3.5} fill="var(--sky-line)" />
    </svg>
  );
}
