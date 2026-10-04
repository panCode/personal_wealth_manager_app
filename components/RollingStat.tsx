"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { cx } from "./ui";

export type Stat = { value: string; label: string };

/**
 * One figure at a time under the hero number, rolling to the next every few
 * seconds: this month → all time → a year. A tap moves it on early. Under
 * prefers-reduced-motion the figures sit side by side and nothing moves. The
 * button's accessible name is the whole list, so a screen reader hears all of
 * it once rather than a ticker.
 */
export function RollingStat({ items, every = 3200, className }: { items: Stat[]; every?: number; className?: string }) {
  const hydrated = useStore((s) => s.hydrated);
  const still = hydrated && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [pos, setPos] = useState<{ i: number; prev: number | null }>({ i: 0, prev: null });
  const n = items.length;

  useEffect(() => {
    if (still || n < 2) return;
    const id = window.setInterval(() => setPos((s) => ({ i: (s.i + 1) % n, prev: s.i })), every);
    return () => window.clearInterval(id);
  }, [still, n, every]);

  const name = items.map((s) => `${s.value} ${s.label}`).join(", ");

  if (still || n < 2) {
    return (
      <span className={cx("flex flex-wrap items-baseline gap-x-2 text-[15px] leading-[1.4]", className)} aria-label={name}>
        {items.map((s, i) => (
          <span key={s.label} className="flex items-baseline gap-1.5">
            {i > 0 && <span className="opacity-50">·</span>}
            <Figure stat={s} />
          </span>
        ))}
      </span>
    );
  }

  const cur = items[pos.i];
  const prev = pos.prev === null ? null : items[pos.prev];
  return (
    <button
      type="button"
      aria-label={name}
      onClick={() => setPos((s) => ({ i: (s.i + 1) % n, prev: s.i }))}
      className={cx("relative block h-7 w-full overflow-hidden text-left text-[15px] leading-[1.4] text-current", className)}
    >
      {prev && (
        <span key={`out-${pos.prev}-${pos.i}`} aria-hidden className="roll-out absolute inset-x-0 top-0 flex items-baseline gap-1.5">
          <Figure stat={prev} />
        </span>
      )}
      <span key={`in-${pos.i}`} aria-hidden className={cx("absolute inset-x-0 top-0 flex items-baseline gap-1.5", prev && "roll-in")}>
        <Figure stat={cur} />
      </span>
    </button>
  );
}

function Figure({ stat }: { stat: Stat }) {
  return (
    <>
      <span className="font-display text-[20px] font-semibold">{stat.value}</span>
      <span className="opacity-80">{stat.label}</span>
    </>
  );
}
