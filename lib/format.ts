/** ₹ formatting in Indian style. Amounts are in rupees. */

export function inr(n: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = true, decimals } = opts;
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (compact) {
    if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7, decimals ?? (abs / 1e7 >= 10 ? 1 : 2))} Cr`;
    if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5, decimals ?? 1)}L`;
    if (abs >= 1e3) return `${sign}₹${trim(abs / 1e3, decimals ?? 1)}k`;
  }
  return `${sign}₹${groupIndian(Math.round(abs))}`;
}

/** Full rupees with Indian grouping: 1,45,000 */
export function inrFull(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}₹${groupIndian(Math.round(Math.abs(n)))}`;
}

export function groupIndian(n: number): string {
  const s = String(n);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

function trim(v: number, d: number): string {
  const s = v.toFixed(d);
  return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function pct(n: number, d = 0): string {
  return `${n.toFixed(d)}%`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayMonth(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Tuesday, 29 Sep" for the given date (defaults to now). Client-only callers. */
export function dayLine(d = new Date()): string {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Time-of-day greeting. Client-only callers. */
export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * A formatter pinned to the unit of `anchor`, so a count-up never flickers
 * between ₹4,86,000 and ₹48.6L. At the anchor itself it matches `inr()`.
 */
export function inrLike(anchor: number): (n: number) => string {
  const abs = Math.abs(anchor);
  if (abs >= 1e7) {
    const d = abs / 1e7 >= 10 ? 1 : 2;
    return (n) => `₹${trim(n / 1e7, d)} Cr`;
  }
  if (abs >= 1e5) return (n) => `₹${trim(n / 1e5, 1)}L`;
  if (abs >= 1e3) return (n) => `₹${trim(n / 1e3, 1)}k`;
  return (n) => `₹${groupIndian(Math.round(n))}`;
}
