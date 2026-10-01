"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { Button, Card, Eyebrow, Row, RowText, Screen, TopBar } from "@/components/ui";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

/** Tester settings: reset, what's been recorded. Reached from the gear and footer on Home, and from Notifications. */
export default function Settings() {
  const router = useRouter();
  const events = useStore((s) => s.events);
  const feedback = useStore((s) => s.feedback);
  const decisions = useStore((s) => s.decisions);
  const reset = useStore((s) => s.reset);
  const [confirm, setConfirm] = useState(false);

  function doReset() {
    reset();
    try {
      localStorage.removeItem("cfo-prototype-v1");
    } catch {
      /* ignore */
    }
    router.push("/");
  }

  return (
    <>
      <TopBar back="/home" title="Settings" />
      <Screen>
        <div className="flex flex-col gap-4 px-5 pb-6 pt-1">
          <Card className="flex flex-col gap-1">
            <span className="text-[14px] font-bold">Demo account: {persona.firstName}, {persona.age}, {persona.city}</span>
            <span className="text-[12px] leading-[1.45] text-muted">Every number is illustrative. Nothing here is connected to a real bank, exchange or fund house.</span>
          </Card>

          <Card padded={false}>
            <Row href="/activity"><RowText title="History" sub="Every decision, who approved it, and what settled" /><ChevronRightIcon size={18} className="text-faint" /></Row>
            <Row href="/notifications"><RowText title="Notifications and what we watch" sub="Per topic: app, WhatsApp, both, or quiet" /><ChevronRightIcon size={18} className="text-faint" /></Row>
            <Row href="/whatsapp" last><RowText title="How it looks on WhatsApp" sub="The same decisions, in a chat" /><ChevronRightIcon size={18} className="text-faint" /></Row>
          </Card>

          <div className="flex flex-col gap-2">
            <Eyebrow>Start over</Eyebrow>
            <Card className="flex flex-col gap-2.5">
              <span className="text-[13px] leading-[1.45] text-ink-2">Clears approvals, labels, answers and notes on this phone, and takes you back to the welcome screen. Handy before handing the phone to someone else.</span>
              {confirm ? (
                <div className="flex gap-2">
                  <Button variant="dark" size="md" className="flex-1" onClick={doReset}>Yes, reset</Button>
                  <Button variant="ghost" size="md" className="flex-1" onClick={() => setConfirm(false)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="secondary" size="md" onClick={() => setConfirm(true)}>Reset this prototype</Button>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-2">
            <Eyebrow>Recorded on this phone</Eyebrow>
            <Card padded={false}>
              <Row><RowText title={`${Object.keys(decisions).length} decisions touched`} sub={Object.entries(decisions).map(([id, r]) => `${id}: ${r.status}`).join(" · ") || "none yet"} /></Row>
              <Row><RowText title={`${events.length} taps recorded`} sub={events.length ? `Last: ${events[events.length - 1].name}` : "none yet"} /></Row>
              <Row last><RowText title={`${feedback.length} feedback notes`} sub={feedback.length ? feedback[feedback.length - 1].text.slice(0, 80) : "none yet"} /></Row>
            </Card>
          </div>

          <div className="flex flex-col gap-2">
            <Eyebrow>Install</Eyebrow>
            <Card className="flex flex-col gap-1 text-[13px] leading-[1.5]">
              <span><strong>iPhone:</strong> Safari → Share → Add to Home Screen.</span>
              <span><strong>Android:</strong> Chrome → ⋮ → Add to Home screen.</span>
            </Card>
          </div>
        </div>
      </Screen>
    </>
  );
}
