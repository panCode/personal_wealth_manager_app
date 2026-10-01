import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon, CloseIcon } from "./icons";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Layout ---------- */

/** Scrollable page body. `nav` adds room for the bottom nav. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar", className)}>{children}</div>;
}

export function TopBar({
  back,
  title,
  right,
  close,
  onClose,
  label,
}: {
  back?: string;
  close?: string;
  /** Close handler instead of a fixed href, e.g. to return to wherever the user came from. */
  onClose?: () => void;
  title?: ReactNode;
  label?: ReactNode;
  right?: ReactNode;
}) {
  const href = back ?? close;
  const navCls = "flex h-11 w-11 items-center justify-center rounded-xl text-ink";
  return (
    <div className="safe-top flex shrink-0 items-center justify-between px-5 pb-2">
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Close" className={navCls}>
          <CloseIcon size={22} />
        </button>
      ) : href ? (
        <Link href={href} aria-label={close ? "Close" : "Back"} className={navCls}>
          {close ? <CloseIcon size={22} /> : <BackIcon size={22} />}
        </Link>
      ) : (
        <div className="h-11 w-11" />
      )}
      {label ? (
        <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">{label}</span>
      ) : title ? (
        <h1 className="font-display text-[22px]">{title}</h1>
      ) : (
        <span />
      )}
      {right ?? <div className="h-11 w-11" />}
    </div>
  );
}

export function Footer({ children }: { children: ReactNode }) {
  return <div className="safe-bottom flex shrink-0 flex-col gap-2 border-t border-line bg-ground px-6 pt-3">{children}</div>;
}

/* ---------- Text ---------- */

export function H1({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cx("font-display text-[26px] leading-[1.15] tracking-[-0.01em]", className)}>{children}</h1>;
}
export function Eyebrow({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "attn" }) {
  return (
    <span className={cx("text-[11px] font-bold uppercase tracking-[0.08em]", tone === "attn" ? "text-attn-text" : "text-muted")}>
      {children}
    </span>
  );
}
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] font-bold">{children}</span>
      {action}
    </div>
  );
}

/* ---------- Surfaces ---------- */

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={cx("rounded-card bg-surface", padded && "p-4", !padded && "overflow-hidden", className)}>
      {children}
    </div>
  );
}
export function DarkCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-card-lg bg-ink p-4 text-white", className)}>{children}</div>;
}
export function Note({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "attn" | "accent" }) {
  const tones = {
    neutral: "bg-sunken text-ink-2",
    attn: "bg-attn-soft text-ink",
    accent: "bg-accent-soft text-ink",
  };
  return <div className={cx("rounded-[14px] px-3.5 py-3 text-[12px] leading-[1.45]", tones[tone])}>{children}</div>;
}

/** A row inside a list card. `href` makes it a link. */
export function Row({
  href,
  onClick,
  children,
  last,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  last?: boolean;
  className?: string;
}) {
  const cls = cx("flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left text-ink", !last && "border-b border-line", className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{children}</button>;
  return <div className={cls}>{children}</div>;
}
export function RowText({ title, sub, subTone }: { title: ReactNode; sub?: ReactNode; subTone?: "accent" | "attn" | "danger" }) {
  const t = subTone === "accent" ? "text-accent font-semibold" : subTone === "attn" ? "text-attn-text font-semibold" : subTone === "danger" ? "text-danger font-semibold" : "text-muted";
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[13px] font-bold">{title}</span>
      {sub && <span className={cx("text-[12px]", t)}>{sub}</span>}
    </div>
  );
}
export function IconBox({ children, tone = "accent", size = 28 }: { children: ReactNode; tone?: "accent" | "neutral" | "attn"; size?: number }) {
  const tones = { accent: "bg-accent-soft text-accent", neutral: "bg-sunken text-ink-2", attn: "bg-attn-soft text-attn-text" };
  return (
    <span className={cx("flex shrink-0 items-center justify-center rounded-lg", tones[tone])} style={{ width: size, height: size }}>
      {children}
    </span>
  );
}

/* ---------- Controls ---------- */

export function Pill({ children, tone = "neutral", className }: { children: ReactNode; tone?: "accent" | "attn" | "neutral" | "dark"; className?: string }) {
  const tones = {
    accent: "bg-accent-soft text-accent",
    attn: "bg-attn-soft text-attn-text",
    neutral: "bg-sunken text-ink-2",
    dark: "bg-ink text-white",
  };
  return <span className={cx("inline-flex h-[26px] shrink-0 items-center rounded-full px-2.5 text-[11px] font-bold whitespace-nowrap", tones[tone], className)}>{children}</span>;
}

export function Chip({
  children,
  selected,
  onClick,
  href,
  size = "md",
  tone = "surface",
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md";
  /** `surface` sits on the ground; use `sunken` for a chip inside a white card. */
  tone?: "surface" | "sunken";
}) {
  const cls = cx(
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-semibold",
    size === "sm" ? "h-8 px-3 text-[12px]" : "h-9 px-3.5 text-[12px]",
    selected ? "bg-accent-soft font-bold text-accent" : tone === "sunken" ? "bg-sunken text-ink" : "bg-surface text-ink"
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string; href?: string }>;
  value: T;
  onChange?: (v: T) => void;
}) {
  return (
    <div className="flex rounded-xl bg-sunken p-1">
      {options.map((o) => {
        const active = o.value === value;
        const cls = cx("flex h-9 flex-1 items-center justify-center rounded-[9px] text-[13px]", active ? "bg-surface font-bold text-ink" : "font-semibold text-muted");
        if (o.href && !active) return <Link key={o.value} href={o.href} className={cls}>{o.label}</Link>;
        return (
          <button key={o.value} type="button" aria-pressed={active} onClick={() => onChange?.(o.value)} className={cls}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function OptionGroup<T extends string>({ options, value, onChange }: { options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            "h-11 flex-1 rounded-xl text-[13px]",
            o.value === value ? "bg-accent-soft font-bold text-accent ring-2 ring-accent ring-inset" : "bg-sunken font-semibold text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "lg",
  type = "button",
  className,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "lg" | "md" | "sm";
  type?: "button" | "submit";
  className?: string;
}) {
  const sizes = { lg: "h-[54px] rounded-btn text-[16px]", md: "h-12 rounded-btn text-[14px]", sm: "h-9 rounded-[12px] px-3.5 text-[13px]" };
  const variants = {
    primary: "bg-accent text-white",
    secondary: "bg-accent-soft text-accent",
    ghost: "bg-sunken text-ink-2",
    dark: "bg-ink text-white",
  };
  const cls = cx("inline-flex items-center justify-center gap-2 font-bold", sizes[size], variants[variant], className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function ProgressBar({ value, tone = "accent", height = 6 }: { value: number; tone?: "accent" | "attn"; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-sunken" style={{ height }}>
      <div className={cx("h-full", tone === "attn" ? "bg-attn" : "bg-accent")} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Avatar({ initials, size = 36, dark }: { initials: string; size?: number; dark?: boolean }) {
  return (
    <span
      className={cx("flex shrink-0 items-center justify-center rounded-full font-bold", dark ? "bg-ink text-white" : "bg-accent-pale text-ink")}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}
