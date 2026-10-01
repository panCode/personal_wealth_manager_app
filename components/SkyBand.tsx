"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { cx } from "./ui";

export type SkyPeriod = "dawn" | "day" | "dusk" | "night";

/** dawn 05–09 · day 09–17 · dusk 17–20 · night 20–05. Mood, never information. */
export function skyPeriod(hour: number): SkyPeriod {
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

const PERIODS: SkyPeriod[] = ["dawn", "day", "dusk", "night"];

/**
 * The band at the top of Home: a gradient that follows the clock, a sun or a
 * moon, two hills that blend it into the page, and whatever the screen puts on
 * it (the hero number). Four gradient layers cross-fade so the change of
 * period is a slow drift, not a flash. Before the store hydrates the band is
 * "day", so server and first client render agree.
 */
export function SkyBand({ children, period: forced, className }: { children: ReactNode; period?: SkyPeriod; className?: string }) {
  const hydrated = useStore((s) => s.hydrated);
  const period: SkyPeriod = forced ?? (hydrated ? skyPeriod(new Date().getHours()) : "day");
  const night = period === "night";

  return (
    <div
      data-sky={period}
      className={cx("relative shrink-0 overflow-hidden transition-colors duration-700", night ? "text-ground" : "text-ink", className)}
      style={{ background: "var(--sky-day)" }}
    >
      {PERIODS.map((p) => (
        <div
          key={p}
          aria-hidden
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ background: `var(--sky-${p})`, opacity: p === period ? 1 : 0 }}
        />
      ))}

      {/* sun or moon */}
      <svg aria-hidden className="absolute right-0 top-0" width="390" height="150" viewBox="0 0 390 150">
        {period === "dawn" && <circle cx="306" cy="112" r="22" fill="#f6cfae" />}
        {period === "day" && <circle cx="312" cy="54" r="18" fill="#fff4d6" />}
        {period === "dusk" && <circle cx="306" cy="98" r="22" fill="#f2c5a3" />}
        {night && (
          <>
            <circle cx="312" cy="54" r="11" fill="#ede7d8" />
            <circle cx="296" cy="50" r="10" fill="#2b3050" />
            <circle cx="70" cy="40" r="1.6" fill="#ede7d8" />
            <circle cx="140" cy="22" r="1.2" fill="#ede7d8" />
            <circle cx="230" cy="36" r="1.4" fill="#ede7d8" />
            <circle cx="350" cy="20" r="1.1" fill="#ede7d8" />
          </>
        )}
      </svg>

      {/* hills: the band's bottom edge */}
      <svg aria-hidden className="absolute bottom-0 left-0 block w-full" height="64" viewBox="0 0 390 64" preserveAspectRatio="none">
        <path d="M0 40 C 70 10, 150 48, 230 26 S 340 8, 390 30 L390 64 L0 64 Z" fill="#eae3d6" />
        <path d="M0 52 C 90 30, 180 58, 260 42 S 350 28, 390 44 L390 64 L0 64 Z" fill="#f4f1ea" />
      </svg>

      <div className="relative">{children}</div>
    </div>
  );
}
