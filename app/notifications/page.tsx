"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon, ClockIcon, DocIcon, EyeIcon, GearIcon, PeopleIcon } from "@/components/icons";
import { Button, Card, Chip, Eyebrow, IconBox, Pill, Row, RowText, Screen, TopBar, cx } from "@/components/ui";
import { decisions } from "@/lib/decisions";
import { useStore, type Channel, type WatchKey } from "@/lib/store";

type Filter = "all" | "needs" | "watching" | "done";

const watch: Array<{ key: WatchKey; title: string; sub: string; fixed?: boolean }> = [
  { key: "decisions", title: "Decisions that need you", sub: "Always on. Approval itself happens only in the app.", fixed: true },
  { key: "money", title: "Money moving", sub: "SIPs, EMIs, salary, FD maturities, large debits" },
  { key: "markets", title: "Markets, only when it touches your plan", sub: "Big moves, plus a Sunday one-line summary" },
  { key: "funds", title: "Your funds", sub: "Manager change, rating change, strategy drift, fee change" },
  { key: "deadlines", title: "Deadlines", sub: "Tax filing, insurance renewals, KYC, lock-ins ending" },
  { key: "news", title: "Rule changes and news", sub: "Budget, SEBI, tax rules. Only if it changes something for you, with what we'll do about it." },
];
const channelLabel: Record<Channel, string> = { app: "App", whatsapp: "WhatsApp", both: "App + WhatsApp" };
const nextChannel: Record<Channel, Channel> = { app: "whatsapp", whatsapp: "both", both: "app" };

/** 12 · Notifications & what we watch for you */
export default function Notifications() {
  const [filter, setFilter] = useState<Filter>("all");
  const live = useStore((s) => s.decisions);
  const channels = useStore((s) => s.channels);
  const quiet = useStore((s) => s.quietMode);
  const setChannel = useStore((s) => s.setChannel);
  const setQuietMode = useStore((s) => s.setQuietMode);

  const needs = ["rebalance-1"].filter((id) => !live[id] || live[id].status === "proposed");
  const doneLive = Object.entries(live).filter(([id, r]) => decisions[id] && r.status !== "declined");

  return (
    <>
      <TopBar back="/home" title="Notifications" right={<a href="#watch" aria-label="What we watch settings" className="flex h-11 w-11 items-center justify-center rounded-xl text-ink"><GearIcon size={22} /></a>} />
      <Screen>
        <div className="flex flex-col gap-4 px-5 pb-4 pt-1">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(["all", "needs", "watching", "done"] as Filter[]).map((f) => (
              <Chip key={f} size="sm" selected={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "needs" ? `Needs you · ${needs.length}` : f === "watching" ? "Watching" : "Done"}
              </Chip>
            ))}
          </div>

          {(filter === "all" || filter === "needs") && (
            <div className="flex flex-col gap-2">
              <Eyebrow tone="attn">Needs you</Eyebrow>
              {needs.length === 0 ? (
                <div className="rounded-card border border-line bg-surface px-3.5 py-3 text-[13px] text-muted">Nothing waiting. We&apos;ll tell you the moment something needs a decision.</div>
              ) : (
                needs.map((id) => (
                  <Link key={id} href={`/decision/${id}`} className="flex items-start gap-3 rounded-card border border-attn-line bg-attn-soft px-3.5 py-3 text-ink">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-attn" />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[13px] font-bold">{decisions[id].summary}</span>
                      <span className="text-[12px] text-muted">Reviewed by {decisions[id].reviewedBy} · sent to {channelLabel[channels.decisions].toLowerCase()} · 8:02 AM</span>
                    </div>
                    <span className="whitespace-nowrap text-[12px] font-bold text-attn-text">Review</span>
                  </Link>
                ))
              )}
            </div>
          )}

          {(filter === "all" || filter === "watching") && (
            <div className="flex flex-col gap-2">
              <Eyebrow>Watching for you</Eyebrow>
              <Card padded={false}>
                <Row><IconBox tone="neutral"><EyeIcon size={16} /></IconBox><RowText title="Nifty fell 1.8% today. No action." sub="Your plan assumes swings like this. We'd bring a buy, not a sell, at −10%. · 3:35 PM" /></Row>
                <Row><IconBox tone="neutral"><PeopleIcon size={16} /></IconBox><RowText title="Fund manager changed at Midcap Opportunities" sub="Watching 2 quarters before we judge. No action yet. · 12 Sep" /></Row>
                <Row><IconBox tone="neutral"><ClockIcon size={16} /></IconBox><RowText title="Your ₹8L FD matures 14 Mar" sub="Auto-renew is off. We'll bring you a decision 2 weeks before. · 10 Sep" /></Row>
                <Row last><IconBox tone="neutral"><DocIcon size={16} /></IconBox><RowText title="Tax: ₹31,000 more deductions open till 31 Mar" sub="NPS 80CCD(1B) and HRA. We'll propose it in January with your bonus. · 1 Sep" /></Row>
              </Card>
            </div>
          )}

          {(filter === "all" || filter === "done") && (
            <div className="flex flex-col gap-2">
              <Eyebrow>Done for you</Eyebrow>
              <Card padded={false}>
                {doneLive.map(([id]) => (
                  <Row key={id}><IconBox><CheckIcon size={16} strokeWidth={2} /></IconBox><RowText title={decisions[id].activityTitle} sub="Approved by you · order with the exchange · today" /></Row>
                ))}
                <Row><IconBox><CheckIcon size={16} strokeWidth={2} /></IconBox><RowText title="SIP of ₹35,000 went through" sub="Split across 3 goals as planned. · 20 Sep" /></Row>
                <Row last><IconBox><CheckIcon size={16} strokeWidth={2} /></IconBox><RowText title="Health top-up policy issued, ₹25L" sub="PDF saved to your documents. Renews 3 Sep 2027. · 6 Sep" /></Row>
              </Card>
            </div>
          )}

          <div id="watch" className="flex flex-col gap-2.5 pt-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-bold">What we watch for you, and where we tell you</span>
              <span className="text-[12px] text-muted">We track these on your behalf. You hear from us only when one matters to your plan. Tap a channel to change it.</span>
            </div>
            <Card padded={false}>
              {watch.map((w, i) => (
                <div key={w.key} className={cx("flex items-center gap-2.5 px-3.5 py-3", i < watch.length - 1 && "border-b border-sunken")}>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-bold">{w.title}</span>
                    <span className="text-[12px] text-muted">{w.sub}</span>
                  </div>
                  {w.fixed ? (
                    <Pill tone="dark">{channelLabel[channels[w.key]]}</Pill>
                  ) : (
                    <button type="button" onClick={() => setChannel(w.key, nextChannel[channels[w.key]])} className="h-[26px] whitespace-nowrap rounded-full border border-line-2 bg-surface px-2.5 text-[11px] font-bold">
                      {channelLabel[channels[w.key]]}
                    </button>
                  )}
                </div>
              ))}
            </Card>
            <Card className="flex items-center justify-between gap-2.5 px-3.5 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold">Quiet mode</span>
                <span className="text-[12px] text-muted">Only decisions. Everything else waits for the Sunday summary.</span>
              </div>
              <button type="button" role="switch" aria-checked={quiet} aria-label="Quiet mode" onClick={() => setQuietMode(!quiet)} className={cx("flex h-7 w-12 shrink-0 items-center rounded-full p-[3px] transition-colors", quiet ? "justify-end bg-accent" : "justify-start bg-line-2")}>
                <span className="h-[22px] w-[22px] rounded-full bg-surface" />
              </button>
            </Card>
            <Button href="/whatsapp" variant="secondary" size="md">See how it looks on WhatsApp</Button>
          </div>
        </div>
      </Screen>
    </>
  );
}
