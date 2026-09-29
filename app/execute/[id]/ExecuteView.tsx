"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";
import { Button, Card, Eyebrow, Footer, Screen, TopBar, cx } from "@/components/ui";
import type { Decision } from "@/lib/decisions";
import { inrFull } from "@/lib/format";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

const sideTone = { sell: "text-danger", buy: "text-accent", set: "text-ink-2" } as const;
const sideLabel = { sell: "Sell", buy: "Buy", set: "Set" } as const;

export function ExecuteView({ decision: d }: { decision: Decision }) {
  const router = useRouter();
  const approve = useStore((s) => s.approve);
  const place = useStore((s) => s.place);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const complete = digits.every((x) => x !== "");

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < 5) refs.current[i + 1]?.focus();
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  }

  function confirm() {
    if (!complete || busy) return;
    setBusy(true);
    approve(d.id);
    // The exchange acknowledges in a moment; we mark it placed right away in the prototype.
    setTimeout(() => {
      place(d.id);
      router.push(`/activity?toast=${d.id}`);
    }, 600);
  }

  return (
    <>
      <TopBar back={`/decision/${d.id}`} label={`Confirm · ${d.kind === "rebalance" ? "Switch order" : d.kind === "sip-change" ? "Mandate change" : "Order"}`} />
      <Screen>
        <div className="flex flex-col gap-[18px] px-6 pb-4 pt-2">
          <h1 className="font-display text-[26px] leading-[1.15]">One OTP and it’s placed</h1>

          <Card padded={false}>
            {d.legs.map((leg, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-sunken px-3.5 py-3">
                <span className={cx("w-11 text-[11px] font-bold uppercase tracking-[0.04em]", sideTone[leg.side])}>{sideLabel[leg.side]}</span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[13px] font-bold">{leg.name}</span>
                  <span className="text-[12px] text-muted">{leg.sub}</span>
                </div>
                <span className="text-[14px] font-bold">{inrFull(leg.amount)}</span>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-1.5 px-3.5 py-3 text-[11px] text-muted">
              <span>Rail: <strong className="text-ink">{d.rail}</strong></span>
              <span>Tax: <strong className="text-ink">₹0</strong></span>
              <span>Exit load: <strong className="text-ink">₹0</strong></span>
            </div>
          </Card>

          <Card className="flex flex-col gap-2.5">
            <label htmlFor="otp0" className="text-[13px] font-bold">Enter the OTP {d.rail.startsWith("BSE") ? "BSE" : "your bank"} sent to {persona.phoneMasked}</label>
            <div className="flex gap-2">
              {digits.map((v, i) => (
                <input
                  key={i}
                  id={`otp${i}`}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={v}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  onPaste={onPaste}
                  aria-label={`OTP digit ${i + 1}`}
                  className={cx(
                    "h-[52px] w-11 rounded-xl bg-surface text-center text-[20px] font-bold text-ink outline-none",
                    v ? "border-2 border-accent" : "border border-line-2 focus:border-accent"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted">The exchange sends it, not us. That’s the 2FA SEBI requires. Any 6 digits work in this prototype.</span>
              <button type="button" className="whitespace-nowrap text-[12px] font-bold text-accent" onClick={() => setDigits(["4", "8", "2", "9", "1", "7"])}>
                Resend
              </button>
            </div>
          </Card>

          <div className="flex flex-col gap-2">
            <Eyebrow>What happens next</Eyebrow>
            <Timeline
              steps={[
                { title: "Today, before 3 PM · order placed", sub: "Today's NAV applies. After 3 PM it would be tomorrow's.", done: true },
                { title: d.kind === "rebalance" ? "Tomorrow · units sold" : "Tomorrow · mandate updated", sub: d.kind === "rebalance" ? "Redemption confirmed by the fund house." : "Your bank confirms the new amount." },
                { title: d.kind === "rebalance" ? "1 Oct · new units in your folio" : "20 Oct · first instalment at the new amount", sub: "We message you at each step. Nothing else to do." },
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Eyebrow>How money moves, always</Eyebrow>
            <Card padded={false}>
              <MoveRow side="buy" text="Your bank → exchange clearing → fund house. Units land in your own folio. SIPs run on a UPI or eNACH mandate you approve once." />
              <MoveRow side="sell" text="Fund house pays your registered bank directly, 1 working day for liquid funds, 2–3 for equity. It never passes through us." />
              <MoveRow side="set" label="Switch" text="A sell and a buy inside one fund house, like this order. No bank hop, but taxed like a sell." last />
            </Card>
          </div>
        </div>
      </Screen>
      <Footer>
        <Button onClick={confirm} className={cx(!complete && "opacity-50")}>
          <CheckIcon size={18} /> {busy ? "Placing…" : "Confirm order"}
        </Button>
        <Button href={`/decision/${d.id}`} variant="ghost" size="md" className="border-0 bg-transparent text-[13px]">Cancel</Button>
      </Footer>
    </>
  );
}

function Timeline({ steps }: { steps: Array<{ title: string; sub: string; done?: boolean }> }) {
  return (
    <div className="flex flex-col pl-1 pt-1">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex w-5 flex-col items-center">
            <span className={cx("mt-[3px] h-3 w-3 rounded-full", s.done ? "bg-accent" : "border-2 border-line-2 bg-surface")} />
            {i < steps.length - 1 && <span className="min-h-[22px] w-0.5 flex-1 bg-line-2" />}
          </div>
          <div className={cx("flex flex-col gap-0.5", i < steps.length - 1 && "pb-3")}>
            <span className="text-[13px] font-bold">{s.title}</span>
            <span className="text-[12px] text-muted">{s.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MoveRow({ side, label, text, last }: { side: "buy" | "sell" | "set"; label?: string; text: string; last?: boolean }) {
  return (
    <div className={cx("flex gap-3 px-3.5 py-3", !last && "border-b border-sunken")}>
      <span className={cx("w-11 shrink-0 text-[11px] font-bold uppercase tracking-[0.04em]", sideTone[side])}>{label ?? sideLabel[side]}</span>
      <span className="text-[12px] leading-[1.45]">{text}</span>
    </div>
  );
}
