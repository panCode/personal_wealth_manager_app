"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Gently counts a rupee amount up from zero on first paint, keeping the unit
 * fixed ("₹48.6L" never flickers through "₹4,86,000"). 450ms, ease-out, and
 * skipped entirely under prefers-reduced-motion. Renders the final string on
 * the server so there is nothing to hydrate differently.
 */
export function CountUp({ value, format, duration = 450, className }: { value: number; format: (n: number) => string; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(value * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format(shown)}</span>;
}
