"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { CloseIcon } from "./icons";
import { cx } from "./ui";

/**
 * Bottom drawer, scoped to the phone frame (the frame is `relative`).
 * `open` toggles it; the backdrop and the X call `onClose`.
 */
export function Drawer({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
  height = 720,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  height?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cx("absolute inset-0 z-40", !open && "pointer-events-none")} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={cx("absolute inset-0 bg-ink/55 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[24px] bg-ground shadow-[0_-8px_32px_rgba(22,32,29,0.18)] transition-transform duration-250 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ height: `min(${height}px, 92%)` }}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-2.5">
          <span className="h-[5px] w-10 rounded-full bg-line-2" />
        </div>
        <div className="flex shrink-0 items-start justify-between px-5 pb-3 pt-1.5">
          <div className="flex flex-col gap-0.5">
            {eyebrow && <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">{eyebrow}</span>}
            <h2 className="font-display text-[24px]">{title}</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 no-scrollbar">{children}</div>
        {footer && <div className="safe-bottom shrink-0 border-t border-line bg-ground px-5 pt-3">{footer}</div>}
      </div>
    </div>
  );
}
