"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon } from "./icons";
import { useStore } from "@/lib/store";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** Browser-only check. Only called once the store reports `hydrated`, which
 *  happens on the client after mount, so `window` is always there. */
function iosNeedsHint(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

/**
 * One-line nudge to install: iOS gets the Share → Add to Home Screen hint
 * (Safari has no install prompt); Android/desktop Chrome gets a real Install
 * button once the browser says the site is installable.
 * Hidden once installed, dismissed, or on the welcome/gate screens.
 */
export function InstallBanner() {
  const path = usePathname();
  const dismissed = useStore((s) => s.dismissedInstallBanner);
  const hydrated = useStore((s) => s.hydrated);
  const dismiss = useStore((s) => s.dismissInstallBanner);
  const [bip, setBip] = useState<BIP | null>(null);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setBip(e as BIP);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!hydrated || dismissed || path === "/gate" || path === "/") return null;
  const kind: "ios" | "android" | "none" = bip ? "android" : iosNeedsHint() ? "ios" : "none";
  if (kind === "none") return null;

  return (
    <div className="flex shrink-0 items-center gap-2.5 border-b border-line bg-surface px-4 py-2.5 text-[12px] leading-[1.4]">
      <span className="flex-1">
        {kind === "ios" ? (
          <>
            <strong>Put it on your home screen:</strong> tap Share, then <em>Add to Home Screen</em>. It opens full-screen like an app.
          </>
        ) : (
          <>
            <strong>Install it</strong> for a full-screen app with an icon.
          </>
        )}
      </span>
      {kind === "android" && bip && (
        <button
          type="button"
          onClick={async () => {
            await bip.prompt();
            const { outcome } = await bip.userChoice;
            if (outcome === "accepted") dismiss();
          }}
          className="h-8 rounded-[9px] bg-accent px-3 text-[12px] font-bold text-white"
        >
          Install
        </button>
      )}
      <button type="button" aria-label="Dismiss" onClick={dismiss} className="flex h-8 w-8 items-center justify-center rounded-full text-muted">
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
