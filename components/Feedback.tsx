"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Drawer } from "./Drawer";
import { ChatIcon } from "./icons";
import { Button } from "./ui";
import { useStore } from "@/lib/store";

/**
 * A small floating "Feedback" pill on every screen. Notes are kept locally and
 * POSTed to /api/feedback, which logs them on the server (Vercel → Logs).
 */
export function Feedback() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const path = usePathname();
  const addFeedback = useStore((s) => s.addFeedback);
  const track = useStore((s) => s.track);

  if (path === "/gate") return null;

  async function send() {
    const t = text.trim();
    if (!t) return;
    addFeedback(t, path);
    track("feedback_sent", { screen: path });
    try {
      await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t, screen: path, ua: navigator.userAgent }) });
    } catch {
      /* local copy is kept regardless */
    }
    setSent(true);
    setText("");
    setTimeout(() => {
      setSent(false);
      setOpen(false);
    }, 1200);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
        className="absolute right-0 top-[38%] z-30 flex h-11 w-8 items-center justify-center rounded-l-xl border border-r-0 border-line-2 bg-surface text-ink-2 shadow-sm"
      >
        <ChatIcon size={16} />
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} eyebrow={`On ${path}`} title="What's wrong, or missing?" height={420}
        footer={<Button onClick={send} className="w-full">{sent ? "Sent, thank you" : "Send"}</Button>}>
        <p className="text-[13px] leading-relaxed text-ink-2">Anything: confusing wording, a number that looks off, something you expected to tap. One line is enough.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="e.g. I didn't understand why the home goal slips"
          className="w-full rounded-card border border-line-2 bg-surface p-3 text-[16px] text-ink outline-none focus:border-accent"
        />
      </Drawer>
    </>
  );
}
