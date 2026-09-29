import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; stroke?: string; strokeWidth?: number };

function Svg({ size = 20, strokeWidth = 1.8, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ShieldIcon = ({ check, ...p }: IconProps & { check?: boolean }) => (
  <Svg {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    {check && <path d="M9 12l2 2 4-4" />}
  </Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M5 12l4 4L19 6" />
  </Svg>
);
export const EyeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const PeopleIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    <path d="M17 13.5a6.5 6.5 0 0 1 4.5 6.5" />
  </Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
);
export const BackIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);
export const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </Svg>
);
export const PieIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v9l6.5 6" />
  </Svg>
);
export const FlagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 21V4" />
    <path d="M5 4h12l-2 4 2 4H5" />
  </Svg>
);
export const ChatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
  </Svg>
);
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const BellIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </Svg>
);
export const TrendIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 17l5-6 4 4 5-7 4 5" />
  </Svg>
);
export const GrowthIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 18l6-6 4 4 6-8" />
    <path d="M16 8h4v4" />
  </Svg>
);
export const BankIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10l9-6 9 6" />
    <path d="M5 10v9h14v-9" />
    <path d="M9 19v-5h6v5" />
  </Svg>
);
export const BuildingIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
  </Svg>
);
export const CardIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </Svg>
);
export const BarsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 15V9" />
    <path d="M12 15V6" />
    <path d="M16 15v-4" />
  </Svg>
);
export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);
export const DocIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h9l5 5v13H6z" />
    <path d="M14 3v6h6" />
    <path d="M9 14h6" />
    <path d="M9 18h6" />
  </Svg>
);
export const SwapIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M4 7h11" />
    <path d="M12 4l3 3-3 3" />
    <path d="M20 17H9" />
    <path d="M12 14l-3 3 3 3" />
  </Svg>
);
export const PencilIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="M13 7l4 4" />
  </Svg>
);
export const GearIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Svg>
);
export const SendIcon = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
  </Svg>
);
export const SearchIcon = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);
export const CarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 13l2-5h14l2 5" />
    <rect x="3" y="13" width="18" height="6" rx="1" />
    <circle cx="7" cy="19" r="1.5" />
    <circle cx="17" cy="19" r="1.5" />
  </Svg>
);
export const BoltIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6l6 6-4 4 6 8" />
    <path d="M20 6l-6 6 4 4-6 8" />
  </Svg>
);
export const RupeeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v18" />
    <path d="M17 8a4 4 0 0 0-4-3H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-3a4 4 0 0 1-4-3" />
  </Svg>
);
export const AlertShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="M12 8v5" />
    <path d="M12 16h.01" />
  </Svg>
);
export const InfoIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01" />
    <path d="M11 12h1v4h1" />
  </Svg>
);
export const GradIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8l8-4 8 4-8 4z" />
    <path d="M8 10v5c0 1.5 2 3 4 3s4-1.5 4-3v-5" />
  </Svg>
);
export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12h18" />
    <path d="M12 3c3 3 3 15 0 18" />
    <path d="M12 3c-3 3-3 15 0 18" />
    <circle cx="12" cy="12" r="9" />
  </Svg>
);
export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);
export const BookmarkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </Svg>
);
