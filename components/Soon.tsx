import { BottomNav } from "./BottomNav";
import { Button, Screen } from "./ui";

/** Placeholder for screens not yet ported. Replaced step by step. */
export function Soon({ title, step }: { title: string; step: string }) {
  return (
    <>
      <Screen>
        <div className="safe-top flex flex-1 flex-col justify-center gap-3 px-6 pb-6">
          <h1 className="font-display text-[26px]">{title}</h1>
          <p className="text-[14px] leading-relaxed text-ink-2">This screen is designed on the canvas and lands in {step}. The core loop works today: Home → Decision → Approve → Activity.</p>
          <Button href="/home" variant="secondary" size="md" className="self-start px-5">Back to Home</Button>
        </div>
      </Screen>
      <BottomNav />
    </>
  );
}
