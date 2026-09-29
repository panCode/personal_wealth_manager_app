"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, ClockIcon, FlagIcon, HomeIcon, PieIcon } from "./icons";
import { cx } from "./ui";

const tabs = [
  { href: "/home", label: "Home", Icon: HomeIcon, match: ["/home", "/spending", "/notifications"] },
  { href: "/portfolio", label: "Portfolio", Icon: PieIcon, match: ["/portfolio"] },
  { href: "/plan", label: "Plan", Icon: FlagIcon, match: ["/plan", "/scenarios", "/simulate"] },
  { href: "/ask", label: "Ask", Icon: ChatIcon, match: ["/ask"] },
  { href: "/activity", label: "Activity", Icon: ClockIcon, match: ["/activity"] },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="safe-bottom flex shrink-0 items-center justify-around border-t border-line bg-surface px-2 pt-1">
      {tabs.map(({ href, label, Icon, match }) => {
        const active = match.some((m) => path === m || path.startsWith(m + "/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cx("flex h-[52px] w-16 flex-col items-center justify-center gap-1 text-[11px]", active ? "font-bold text-accent" : "font-semibold text-muted")}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
