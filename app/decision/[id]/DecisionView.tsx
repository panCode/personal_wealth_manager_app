"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckIcon } from "@/components/icons";
import { Avatar, Button, Card, Eyebrow, Footer, Note, Screen, TopBar } from "@/components/ui";
import type { Decision } from "@/lib/decisions";
import { useStore } from "@/lib/store";

export function DecisionView({ decision: d }: { decision: Decision }) {
  const router = useRouter();
  const status = useStore((s) => s.decisions[d.id]?.status ?? "proposed");
  const decline = useStore((s) => s.decline);
  const track = useStore((s) => s.track);

  useEffect(() => {
    track("decision_viewed", { id: d.id });
  }, [d.id, track]);

  const done = status !== "proposed";

  // Return to whichever screen opened this decision. Direct opens (notification
  // link, fresh PWA launch) have no history, so fall back to Home.
  function close() {
    if (window.history.length > 1) router.back();
    else router.push("/home");
  }

  return (
    <>
      <TopBar
        onClose={close}
        label={
          <span className="flex items-center gap-1.5 text-attn-text">
            <span className="h-2 w-2 rounded-full bg-attn" />
            {d.eyebrow}
          </span>
        }
      />
      <Screen>
        <div className="flex flex-col gap-[18px] px-6 pb-4 pt-2">
          <h1 className="font-display text-[28px] leading-[1.15] tracking-[-0.01em]">{d.title}</h1>

          {done && (
            <Note tone={status === "declined" ? "neutral" : "accent"}>
              {status === "declined" ? "You declined this one. It stays here for reference; nothing was changed." : "Approved. The order is with the exchange. Track it under Activity."}
            </Note>
          )}

          <div className="flex flex-col gap-2">
            <Eyebrow>Why now</Eyebrow>
            <p className="text-[15px] leading-[1.5]">{d.why}</p>
          </div>

          {d.impact && (
            <Card className="flex flex-col gap-2.5">
              <Eyebrow>{d.impact.label}</Eyebrow>
              <ImpactBar label="Now" value={d.impact.now} tone="attn" />
              <ImpactBar label="After" value={d.impact.after} tone="accent" />
              {d.impactNote && <span className="text-[12px] text-muted">{d.impactNote}</span>}
            </Card>
          )}

          <div className="grid grid-cols-2 gap-2">
            {d.facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1 rounded-xl border border-line bg-surface p-3">
                <span className="text-[11px] font-semibold text-muted">{f.label}</span>
                <span className="font-display text-[20px] text-accent">{f.value}</span>
                <span className="text-[11px] text-muted">{f.sub}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Eyebrow>If you approve</Eyebrow>
            <div className="flex flex-col gap-2 text-[14px] leading-[1.45]">
              {d.ifApproved.map((step, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-accent-soft px-3.5 py-3">
            <Avatar initials="MI" size={32} />
            <span className="text-[12px] leading-[1.4]">
              <strong>Reviewed by {d.reviewedBy}</strong>, SEBI-registered wealth manager, on 26 Sep. She is accountable for this recommendation.
            </span>
          </div>
        </div>
      </Screen>
      <Footer>
        {done ? (
          <Button href="/activity" variant="dark">See it in History</Button>
        ) : (
          <>
            <Button href={`/execute/${d.id}`}>
              <CheckIcon size={18} /> Approve
            </Button>
            <div className="flex gap-2">
              <Button href="/ask" variant="secondary" size="md" className="flex-1">Ask a question</Button>
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => {
                  track("decision_deferred", { id: d.id });
                  close();
                }}
              >
                Not now
              </Button>
            </div>
            <button
              type="button"
              onClick={() => {
                decline(d.id);
                router.push("/activity?toast=declined");
              }}
              className="h-9 text-[12px] font-bold text-muted"
            >
              Decline this recommendation
            </button>
          </>
        )}
      </Footer>
    </>
  );
}

function ImpactBar({ label, value, tone }: { label: string; value: number; tone: "attn" | "accent" }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-11 text-[12px] text-muted">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-sunken">
        <div className={`h-full ${tone === "attn" ? "bg-attn" : "bg-accent"}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-[34px] text-right text-[13px] font-bold">{value}%</span>
    </div>
  );
}
