import Link from "next/link";
import { ArrowRightIcon, CheckIcon, EyeIcon, PeopleIcon, ShieldIcon } from "@/components/icons";
import { IconBox, Screen } from "@/components/ui";

/** 1 · Welcome */
export default function Welcome() {
  return (
    <Screen>
      <div className="safe-top flex flex-1 flex-col gap-7 px-6 pb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent text-white">
            <ShieldIcon size={18} strokeWidth={2} check />
          </span>
          <span className="text-[13px] font-bold uppercase tracking-[0.12em]">Your CFO</span>
        </div>

        <div className="flex flex-col gap-3.5">
          <h1 className="font-display text-[40px] leading-[1.08] tracking-[-0.01em]">A wealth manager for everyone.</h1>
          <p className="text-[16px] leading-[1.5] text-ink-2">Tell us your goals. We build the plan, watch your money every day, and bring you only the decisions that matter.</p>
        </div>

        <div className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface p-[18px]">
          <Point icon={<PeopleIcon size={20} />} title="Built by real wealth managers" sub="A named, SEBI-registered person stands behind every plan." />
          <Point icon={<CheckIcon size={20} strokeWidth={1.8} />} title="Nothing moves without your approval" sub="Every action is a decision you approve or decline." />
          <Point icon={<EyeIcon size={20} />} title="Read-only access" sub="We can see your accounts, never move your money." />
        </div>

        <div className="flex-1" />

        <form action="/connect" className="flex flex-col gap-2.5">
          <label htmlFor="phone" className="text-[13px] font-semibold text-ink-2">Mobile number</label>
          <div className="flex h-[52px] items-center gap-2.5 rounded-btn border border-line-2 bg-surface px-4">
            <span className="text-[16px] font-semibold text-ink-2">+91</span>
            <input id="phone" name="phone" type="tel" inputMode="numeric" placeholder="98765 43210" className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none" />
          </div>
          <button type="submit" className="flex h-[54px] items-center justify-center gap-2 rounded-btn bg-accent text-[16px] font-bold text-white">
            Continue with OTP <ArrowRightIcon size={18} />
          </button>
          <p className="mt-1.5 text-center text-[11px] leading-[1.45] text-muted">[SEBI registration number] · Investments are subject to market risk.</p>
          <Link href="/home" className="text-center text-[12px] font-bold text-accent">Skip to the demo account</Link>
        </form>
      </div>
    </Screen>
  );
}

function Point({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconBox size={36}>{icon}</IconBox>
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-bold">{title}</span>
        <span className="text-[13px] text-muted">{sub}</span>
      </div>
    </div>
  );
}
