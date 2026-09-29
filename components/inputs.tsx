"use client";

import { groupIndian } from "@/lib/format";
import { cx } from "./ui";

/** Rupee amount input with Indian grouping (1,45,000). Stores a plain number. */
export function MoneyInput({ id, value, onChange, compact }: { id: string; value: number; onChange: (n: number) => void; compact?: boolean }) {
  return (
    <div className={cx("flex items-center gap-1.5 rounded-xl border border-line-2 bg-surface px-3", compact ? "h-10 w-[140px]" : "h-12 w-full px-3.5")}>
      <span className="text-[15px] text-ink-2">₹</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value ? groupIndian(value) : ""}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className={cx("min-w-0 flex-1 bg-transparent font-semibold text-ink outline-none", compact ? "text-[15px]" : "text-[18px]")}
      />
      {!compact && <span className="text-[13px] text-muted">/ month</span>}
    </div>
  );
}
