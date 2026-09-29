"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, BankIcon, BarsIcon, BuildingIcon, CardIcon, CheckIcon, LockIcon, ShieldIcon, TrendIcon } from "@/components/icons";
import { Button, Card, Footer, H1, IconBox, Note, Screen, TopBar } from "@/components/ui";
import { useStore, type ConnectionKey } from "@/lib/store";

const rows: Array<{ key: ConnectionKey; label: string; sub: string; subConnected: string; icon: React.ReactNode; cta: string }> = [
  { key: "mf", label: "Mutual funds", sub: "via MFCentral, one OTP", subConnected: "via MFCentral · 14 folios found", icon: <TrendIcon size={20} />, cta: "Connect" },
  { key: "bank", label: "Bank accounts", sub: "via Account Aggregator, read-only", subConnected: "via Account Aggregator · HDFC, ICICI", icon: <BankIcon size={20} />, cta: "Connect" },
  { key: "loan", label: "Home loan", sub: "via Account Aggregator", subConnected: "SBI · ₹42.3L outstanding · 8.6%", icon: <BuildingIcon size={20} />, cta: "Connect" },
  { key: "epf", label: "EPF & PPF", sub: "UAN login · read-only", subConnected: "UAN linked · ₹12.1L + ₹3.4L", icon: <CardIcon size={20} />, cta: "Connect" },
  { key: "stocks", label: "Stocks & ETFs", sub: "Zerodha, Groww or any demat", subConnected: "Zerodha · 3 holdings", icon: <BarsIcon size={20} />, cta: "Connect" },
  { key: "insurance", label: "Insurance", sub: "Upload policy PDFs, we read them", subConnected: "Term ₹1 Cr · Health ₹10L", icon: <ShieldIcon size={20} />, cta: "Add" },
];

/** 2 · Connect accounts */
export default function Connect() {
  const connections = useStore((s) => s.onboarding.connections);
  const setOnboarding = useStore((s) => s.setOnboarding);
  const track = useStore((s) => s.track);
  const [busy, setBusy] = useState<ConnectionKey | null>(null);

  function connect(key: ConnectionKey) {
    setBusy(key);
    track("connect", { key });
    setTimeout(() => {
      setOnboarding({ connections: { ...connections, [key]: true } });
      setBusy(null);
    }, 900);
  }

  const count = Object.values(connections).filter(Boolean).length;

  return (
    <>
      <TopBar back="/" label="Step 1 of 3" />
      <Screen>
        <div className="flex flex-col gap-[22px] px-6 pb-6 pt-2">
          <div className="flex flex-col gap-2.5">
            <H1>Bring your money into one view</H1>
            <p className="text-[15px] leading-[1.5] text-ink-2">Connect what you have. Anything you skip can be added later.</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {rows.map((r) => {
              const on = connections[r.key];
              return (
                <Card key={r.key} className="flex items-center gap-3.5 px-4 py-3.5">
                  <IconBox size={40} tone={on ? "accent" : "neutral"}>{r.icon}</IconBox>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-bold">{r.label}</span>
                    <span className="text-[12px] text-muted">{on ? r.subConnected : r.sub}</span>
                  </div>
                  {on ? (
                    <span className="flex items-center gap-1 text-[12px] font-bold text-accent">
                      <CheckIcon size={16} /> Connected
                    </span>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => connect(r.key)}>
                      {busy === r.key ? "Connecting…" : r.cta}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          <Note>
            <span className="flex items-start gap-2.5">
              <LockIcon size={18} className="mt-px shrink-0" />
              <span>Read-only, consent-based access. We never store your bank or broker passwords and can never move money.</span>
            </span>
          </Note>
        </div>
      </Screen>
      <Footer>
        <Button href="/about">
          Continue{count ? ` with ${count} connected` : ""} <ArrowRightIcon size={18} />
        </Button>
        <Link
          href="/about"
          onClick={() => {
            setOnboarding({ connections: { ...connections, bank: false } });
            track("connect_skip_bank");
          }}
          className="flex h-11 items-center justify-center text-[13px] font-bold text-ink-2"
        >
          Skip the bank, I&apos;ll type my numbers
        </Link>
      </Footer>
    </>
  );
}
