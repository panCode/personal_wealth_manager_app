import { Feedback } from "./Feedback";
import { InstallBanner } from "./InstallBanner";

/**
 * On phones: the app fills the screen.
 * On desktop: a 390px column centred on a neutral backdrop, so reviewers see
 * the phone layout without resizing their window.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh sm:flex sm:items-start sm:justify-center sm:py-6">
      {/* `overflow-clip`, not `hidden`: a hidden-overflow box is still a scroll
          container and gets scrolled by anchor jumps / scrollIntoView / focus,
          which would drag closed drawers up into view. `clip` cannot scroll. */}
      <div className="relative mx-auto flex h-dvh w-full flex-col overflow-clip bg-ground sm:h-[844px] sm:w-[390px] sm:rounded-[28px] sm:border sm:border-line-2 sm:shadow-[0_12px_40px_rgba(22,32,29,0.18)]">
        <InstallBanner />
        {children}
        <Feedback />
      </div>
    </div>
  );
}
