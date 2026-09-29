import { ShieldIcon } from "@/components/icons";

export default async function Gate({ searchParams }: PageProps<"/gate">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/home";
  const error = sp.error === "1";
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 px-6 pb-10">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent text-white">
          <ShieldIcon size={18} check />
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[0.12em]">Your CFO</span>
      </div>
      <h1 className="font-display text-[32px] leading-[1.1]">Private preview</h1>
      <p className="text-[15px] leading-relaxed text-ink-2">Enter the passcode you were sent.</p>
      <form action="/api/gate" method="post" className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        <label htmlFor="code" className="text-[13px] font-semibold text-ink-2">Passcode</label>
        <input
          id="code"
          name="code"
          type="password"
          autoComplete="one-time-code"
          className="h-[52px] rounded-btn border border-line-2 bg-surface px-4 text-ink outline-none focus:border-accent"
        />
        {error && <span className="text-[13px] font-semibold text-danger">That passcode didn&apos;t match.</span>}
        <button type="submit" className="mt-1 h-[54px] rounded-btn bg-accent text-[16px] font-bold text-white">Enter</button>
      </form>
    </div>
  );
}
