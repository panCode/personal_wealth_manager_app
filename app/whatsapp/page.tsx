"use client";

import Link from "next/link";
import { useState } from "react";
import { BackIcon, SendIcon, ShieldIcon } from "@/components/icons";
import { cx } from "@/components/ui";
import { inr } from "@/lib/format";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

type Msg = { from: "cfo" | "you"; text: React.ReactNode; time: string; cta?: { label: string; href: string } };

/** 13 · The same, on WhatsApp. Neutral chat styling, nothing branded. */
export default function WhatsApp() {
  const rebalance = useStore((s) => s.decisions["rebalance-1"]?.status ?? "proposed");
  const track = useStore((s) => s.track);
  const [extra, setExtra] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  const base: Msg[] = [
    rebalance === "proposed"
      ? { from: "cfo", time: "8:02 AM", text: "Morning, Aditya. One decision needs you today: move ₹1.2L from Bluechip Large-cap to Flexi-cap. Large-caps drifted to 41% of equity, plan says 35%. Meera has reviewed it. Tax ₹0.", cta: { label: "Review in app", href: "/decision/rebalance-1" } }
      : { from: "cfo", time: "8:02 AM", text: rebalance === "declined" ? "Noted, you declined the rebalance. Nothing changed; we'll revisit at the next review." : "Your rebalance is with the exchange. Units settle by 1 Oct; we'll message you when they land." },
    { from: "cfo", time: "10:15 AM", text: "Done: your SIP of ₹60,000 went through, split across your 3 goals. Nothing to do." },
    { from: "you", time: "3:41 PM", text: "Market fell today. Should I do anything?" },
    { from: "cfo", time: "3:42 PM", text: <>No. Nifty fell 1.8%. Your equity is for 2031 and beyond, and the plan assumes swings like this. If it falls 10% or more, we&apos;d bring you a buy decision, not a sell.<br /><br />Want Meera to call you? Reply CALL.</> },
    { from: "you", time: "3:44 PM", text: "CALL" },
    { from: "cfo", time: "3:44 PM", text: "Booked: Meera Iyer, tomorrow 6:00 PM, 15 minutes. Calendar invite sent. She'll have your portfolio open." },
  ];

  function send() {
    const t = text.trim();
    if (!t) return;
    setText("");
    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    const reply: Msg = /call/i.test(t)
      ? { from: "cfo", time, text: "Booked: Meera, tomorrow 6:00 PM. Calendar invite sent." }
      : { from: "cfo", time, text: "Got it. I can answer this properly in the app, where I can show you the numbers. Or reply CALL and Meera rings you.", cta: { label: "Open Ask in app", href: "/ask" } };
    setExtra((m) => [...m, { from: "you", time, text: t }, reply]);
    track("whatsapp_message", { text: t });
  }

  return (
    <div className="flex h-full flex-col bg-chat-bg">
      <div className="safe-top flex shrink-0 items-center gap-3 border-b border-line bg-ground px-4 pb-2.5">
        <Link href="/notifications" aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-xl text-ink"><BackIcon size={22} /></Link>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white"><ShieldIcon size={20} strokeWidth={2} check /></span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[15px] font-bold">Your CFO</span>
          <span className="text-[12px] text-muted">WhatsApp · verified business · replies in minutes</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-3 no-scrollbar">
        <span className="self-center rounded-full bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted">Nothing is approved here. Approvals need the app and an exchange OTP.</span>
        <span className="self-center py-1.5 text-[11px] font-bold text-muted">Today</span>
        {[...base, ...extra].map((m, i) => (
          <div key={i} className={cx("flex max-w-[300px] flex-col gap-1.5 px-3 py-2.5 text-[14px] leading-[1.45] shadow-[0_1px_1px_rgba(22,32,29,0.06)]", m.from === "cfo" ? "self-start rounded-[14px_14px_14px_4px] bg-surface" : "self-end rounded-[14px_14px_4px_14px] bg-chat-out")}>
            <span>{m.text}</span>
            {m.cta && <Link href={m.cta.href} className="flex h-10 items-center justify-center rounded-[10px] bg-accent-soft text-[13px] font-bold text-accent">{m.cta.label}</Link>}
            <span className="self-end text-[10px] text-faint">{m.time}</span>
          </div>
        ))}
        <span className="self-center py-1.5 text-[11px] font-bold text-muted">Sunday summary, every week</span>
        <div className="flex max-w-[300px] flex-col gap-1 self-start rounded-[14px_14px_14px_4px] bg-surface px-3 py-2.5 text-[14px] leading-[1.45] shadow-[0_1px_1px_rgba(22,32,29,0.06)]">
          <span>Week in one line: net worth {inr(persona.netWorth.total)} (+0.4%), {rebalance === "proposed" ? "1 decision waiting" : "1 decision done, 0 waiting"}, all 3 goals on plan.</span>
          <span className="self-end text-[10px] text-faint">Sun 9:00 AM</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="safe-bottom flex shrink-0 flex-col gap-1.5 border-t border-line bg-ground px-3 pt-2"
      >
        <div className="flex items-center gap-2">
          <label htmlFor="wa" className="sr-only">Message</label>
          <input id="wa" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask anything about your money" className="h-11 min-w-0 flex-1 rounded-full border border-line-2 bg-surface px-3.5 text-[16px] text-ink outline-none focus:border-accent" />
          <button type="submit" aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white"><SendIcon size={18} /></button>
        </div>
        <span className="text-center text-[11px] text-muted">We never ask for OTPs, passwords or payments on WhatsApp.</span>
      </form>
    </div>
  );
}
