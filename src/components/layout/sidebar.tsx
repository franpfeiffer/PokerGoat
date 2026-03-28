"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

const mainNavItems = [
  { href: "/dashboard", icon: "dashboard", translationKey: "dashboard" },
  { href: "/groups", icon: "groups", translationKey: "groups" },
  { href: "/profile", icon: "profile", translationKey: "profile" },
] as const;

const toolItems = [
  { href: "/goat-eye", icon: "goatEye", translationKey: "goatEye" },
  { href: "/side-pots", icon: "sidePots", translationKey: "sidePots" },
] as const;

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-velvet-800 lg:bg-velvet-950">
      <div className="flex h-14 items-center px-5 border-b border-velvet-800">
        <Link href="/dashboard" className="focus-ring rounded font-display text-lg font-bold text-gold-500">
          PokerGoat
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2.5" aria-label="Principal">
        {mainNavItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-velvet-800 text-velvet-50"
                  : "text-velvet-500 hover:bg-velvet-900 hover:text-velvet-200"
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              {t(item.translationKey)}
              {isActive && <span className="ml-auto h-1 w-1 rounded-full bg-gold-500" />}
            </Link>
          );
        })}

        <div className="my-2 h-px bg-velvet-800" />

        {toolItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-velvet-800 text-velvet-50"
                  : "text-velvet-500 hover:bg-velvet-900 hover:text-velvet-200"
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              {t(item.translationKey)}
              {isActive && <span className="ml-auto h-1 w-1 rounded-full bg-gold-500" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.5 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "groups":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "goatEye":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      );
    case "sidePots":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M6 12h12" />
        </svg>
      );
    case "profile":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      );
    default:
      return null;
  }
}
