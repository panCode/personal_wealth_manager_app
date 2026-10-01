"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Drawer } from "@/components/Drawer";
import { SendIcon } from "@/components/icons";
import { Avatar, Button, Chip, OptionGroup, cx } from "@/components/ui";
import { answers, fallback, findAnswer, suggested, type Answer } from "@/lib/answers";
import { persona } from "@/lib/persona";
import { useStore } from "@/lib/store";

type Msg = { role: "user"; text: string } | { role: "cfo"; answer: Answer | null; typing?: boolean };

/**
 * 10 · Ask your CFO
 * `?q=<answer id>` seeds the chat with that answer instead of the default
 * (Home's chips and Plan's health row link in this way); `?text=<question>`
 * seeds it with a question typed into the box on Home. `useSearchParams`
 * needs a Suspense boundary above it for the static build, same as Activity.
 */
export default function AskPage() {
  return (
    <Suspense>
      <Ask />
    </Suspense>
  );
}

function Ask() {
  const sp = useSearchParams();
  const q = sp.get("q");
  const typed = sp.get("text")?.trim();
  const seed = answers.find((a) => a.id === q) ?? answers[0];
  const [msgs, setMsgs] = useState<Msg[]>(() =>
    typed
      ? [
          { role: "user", text: typed },
          { role: "cfo", answer: findAnswer(typed) },
        ]
      : [
          { role: "user", text: seed.question },
          { role: "cfo", answer: seed },
        ],
  );
  const [text, setText] = useState("");
  const [book, setBook] = useState(false);
  const [slot, setSlot] = useState<"tomorrow-6" | "thu-1" | "sat-11">("tomorrow-6");
  const [booked, setBooked] = useState(false);
  const track = useStore((s) => s.track);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgs.length > 2) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs]);

  function ask(q: string) {
    const t = q.trim();
    if (!t) return;
    setText("");
    const a = findAnswer(t);
    track("ask", { q: t, matched: a?.id ?? "none" });
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "cfo", answer: a, typing: true }]);
    setTimeout(() => setMsgs((m) => m.map((x, i) => (i === m.length - 1 && x.role === "cfo" ? { ...x, typing: false } : x))), 700);
  }

  const askedIds = new Set(msgs.flatMap((m) => (m.role === "cfo" && m.answer ? [m.answer.id] : [])));
  const suggestions = suggested
    .map((id) => answers.find((a) => a.id === id))
    .filter((a): a is Answer => !!a && !askedIds.has(a.id))
    .slice(0, 3);

  return (
    <>
      <div className="safe-top flex shrink-0 items-center justify-between border-b border-line px-5 pb-2.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[22px]">Ask your CFO</h1>
          <span className="text-[12px] text-muted">Answers use your real numbers</span>
        </div>
        <button type="button" onClick={() => setBook(true)} className="flex h-9 items-center gap-1.5 rounded-[12px] bg-surface px-3 text-[12px] font-bold">
          <Avatar initials={persona.wealthManager.initials} size={20} /> Talk to Meera
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4 no-scrollbar">
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="max-w-[300px] self-end rounded-[16px_16px_4px_16px] bg-ink px-3.5 py-3 text-[14px] leading-[1.45] text-white">{m.text}</div>
          ) : (
            <CfoBubble key={i} answer={m.answer} typing={m.typing} onBook={() => setBook(true)} />
          )
        )}
        {suggestions.length > 0 && (
          <div className="mt-1 flex flex-col gap-2">
            <span className="text-[12px] font-semibold text-muted">People also ask</span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((a) => (
                <Chip key={a.id} size="sm" onClick={() => ask(a.question)}>{a.question}</Chip>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
        className="flex shrink-0 items-center gap-2 bg-ground px-4 pb-3 pt-2.5"
      >
        <label htmlFor="q" className="sr-only">Ask anything about your money</label>
        <input id="q" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask anything about your money" className="h-12 min-w-0 flex-1 rounded-btn border border-line-2 bg-surface px-4 text-[16px] text-ink outline-none focus:border-accent" />
        <button type="submit" aria-label="Send" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn bg-accent text-white">
          <SendIcon size={20} />
        </button>
      </form>
      <BottomNav />

      <Drawer open={book} onClose={() => setBook(false)} eyebrow="15 minutes, phone or video" title="Talk to Meera" height={460}
        footer={booked ? <Button onClick={() => setBook(false)} variant="dark">Done</Button> : <Button onClick={() => { setBooked(true); track("call_booked", { slot }); }}>Book it</Button>}>
        {booked ? (
          <div className="flex flex-col gap-2 rounded-card bg-accent-soft p-4 text-[14px] leading-relaxed">
            <strong>Booked.</strong> Meera will call you {slot === "tomorrow-6" ? "tomorrow at 6:00 PM" : slot === "thu-1" ? "Thursday at 1:00 PM" : "Saturday at 11:00 AM"}. She’ll have your portfolio and this conversation open. Calendar invite sent.
          </div>
        ) : (
          <>
            <p className="text-[14px] leading-relaxed text-ink-2">Anything the app can’t answer, or anything you’d rather hear from a person. No charge; it’s part of the plan.</p>
            <OptionGroup
              value={slot}
              onChange={setSlot}
              options={[
                { value: "tomorrow-6", label: "Tomorrow 6 PM" },
                { value: "thu-1", label: "Thu 1 PM" },
                { value: "sat-11", label: "Sat 11 AM" },
              ]}
            />
            <span className="text-[12px] text-muted">Urgent? Reply CALL on WhatsApp and she calls within the hour on working days.</span>
          </>
        )}
      </Drawer>
    </>
  );
}

function CfoBubble({ answer, typing, onBook }: { answer: Answer | null; typing?: boolean; onBook: () => void }) {
  if (typing) {
    return (
      <div className="flex w-16 items-center justify-center gap-1 self-start rounded-[16px_16px_16px_4px] border border-line bg-surface px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-faint" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    );
  }
  const a = answer;
  return (
    <div className="flex max-w-[330px] flex-col gap-2.5 self-start rounded-[16px_16px_16px_4px] border border-line bg-surface p-3.5 text-[14px] leading-[1.5]">
      <p className="font-semibold">{a ? a.lead : fallback.lead}</p>
      {a?.facts && (
        <div className="flex flex-col gap-1.5 rounded-[10px] bg-ground px-3 py-2.5 text-[13px]">
          {a.facts.map((f) => (
            <div key={f.label} className="flex justify-between gap-3">
              <span className="text-muted">{f.label}</span>
              <span className={cx("text-right font-bold", f.tone === "attn" && "text-attn-text")}>{f.value}</span>
            </div>
          ))}
        </div>
      )}
      {(a ? a.body : fallback.body).map((t, i) => (
        <p key={i}>{t}</p>
      ))}
      {a?.actions ? (
        <div className="mt-0.5 flex flex-wrap gap-2">
          {a.actions.map((act) => (
            <Link key={act.label} href={act.href} className={cx("flex h-10 items-center rounded-[10px] px-3.5 text-[13px] font-bold", act.primary ? "bg-accent text-white" : "border border-line-2 bg-surface text-ink")}>
              {act.label}
            </Link>
          ))}
        </div>
      ) : (
        !a && (
          <button type="button" onClick={onBook} className="mt-0.5 flex h-10 items-center self-start rounded-[10px] bg-accent px-3.5 text-[13px] font-bold text-white">
            Add it to Meera&apos;s list
          </button>
        )
      )}
      {a?.footnote && <span className="text-[11px] text-muted">{a.footnote}</span>}
    </div>
  );
}
