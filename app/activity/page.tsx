"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CheckIcon } from "@/components/icons";
import { Card, Eyebrow, Screen } from "@/components/ui";
import { decisions } from "@/lib/decisions";
import { dayMonth } from "@/lib/format";
import { useStore } from "@/lib/store";

type Item = { date: string; title: string; sub: React.ReactNode; live?: boolean };

const history: Item[] = [
  { date: "2026-09-20", title: "Monthly SIP ₹35,000 ran", sub: "Auto, as per plan · split across 3 goals" },
  {
    date: "2026-09-12",
    title: "Book a ₹40k loss on a midcap fund to offset gains",
    sub: (
      <>
        Proposed by CFO · <strong className="text-attn-text">declined by you</strong> · &ldquo;I&rsquo;ll hold this one&rdquo;
      </>
    ),
  },
  {
    date: "2026-09-03",
    title: "Health cover top-up ₹25L super top-up",
    sub: (
      <>
        Proposed by CFO · reviewed by Meera · <strong className="text-accent">approved by you</strong> · policy issued
      </>
    ),
  },
  { date: "2026-09-01", title: "Monthly review call with Meera · 20 min", sub: "Plan re-confirmed · notes and recording saved" },
];

/** 11 · Activity & track record */
export default function ActivityPage() {
  return (
    <Suspense>
      <Activity />
    </Suspense>
  );
}

function Activity() {
  const sp = useSearchParams();
  const toastId = sp.get("toast");
  const live = useStore((s) => s.decisions);

  const liveItems: Item[] = Object.entries(live)
    .filter(([id]) => decisions[id])
    .map(([id, rec]) => {
      const d = decisions[id];
      const approved = rec.status !== "declined";
      return {
        date: rec.at,
        live: true,
        title: d.activityTitle,
        sub: approved ? (
          <>
            Proposed by CFO · reviewed by Meera · <strong className="text-accent">approved by you</strong>
            {rec.status === "placed" ? " · order placed" : rec.status === "settled" ? " · settled" : ""}
          </>
        ) : (
          <>
            Proposed by CFO · <strong className="text-attn-text">declined by you</strong>
          </>
        ),
      };
    });

  const items = [...liveItems, ...history].sort((a, b) => (a.date < b.date ? 1 : -1));
  const liveRecords = Object.entries(live).filter(([id]) => decisions[id]).map(([, r]) => r);
  const approvedCount = 2 + liveRecords.filter((r) => r.status !== "declined").length;
  const declinedCount = 1 + liveRecords.filter((r) => r.status === "declined").length;

  const toast = toastId === "declined" ? "Noted. Nothing was changed." : toastId && decisions[toastId] ? decisions[toastId].approvedToast : null;

  return (
    <>
      <Screen>
        <div className="safe-top flex flex-col gap-4 px-5 pb-4">
          {toast && (
            <div role="status" className="flex items-center gap-2.5 rounded-xl border border-accent-pale bg-accent-soft px-3.5 py-3">
              <CheckIcon size={18} className="text-accent" />
              <span className="text-[13px] font-semibold">{toast}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[26px]">Activity</h1>
            <span className="text-[14px] text-ink-2">Everything your CFO did, and who signed off.</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Stat value="27" label="days watched" />
            <Stat value={String(approvedCount)} label="approved" />
            <Stat value={String(declinedCount)} label="declined" />
            <Stat value="₹0" label="commissions" />
          </div>

          <div className="flex flex-col gap-2.5">
            <Eyebrow>September</Eyebrow>
            <Card padded={false}>
              {items.map((it, i) => (
                <div key={i} className={`flex gap-3 px-3.5 py-3 ${i < items.length - 1 ? "border-b border-sunken" : ""}`}>
                  <span className="w-11 shrink-0 text-[12px] font-bold text-muted">{dayMonth(it.date)}</span>
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-[13px] font-bold">{it.title}</span>
                    <span className="text-[12px] text-muted">{it.sub}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div className="flex flex-col gap-2.5">
            <Eyebrow>Since you joined · Jan 2026</Eyebrow>
            <Card className="flex flex-col gap-2 text-[13px]">
              <Line label="Decisions brought to you" value={String(11 + liveItems.length)} />
              <Line label="Days nothing needed doing" value="254 of 270" />
              <Line label="Fees paid to us" value="[FLAT FEE]" />
              <Line label="Commissions earned from you" value="₹0" accent />
            </Card>
          </div>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-line bg-surface px-2 py-2.5 text-center">
      <span className="font-display text-[22px]">{value}</span>
      <span className="text-[10px] font-semibold text-muted">{label}</span>
    </div>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-bold ${accent ? "text-accent" : ""}`}>{value}</span>
    </div>
  );
}
