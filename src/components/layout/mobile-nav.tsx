"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

const toolPaths = ["/goat-eye", "/side-pots", "/tools", "/head-to-head"];

const navItems = [
  { href: "/dashboard", icon: "home", translationKey: "dashboard" },
  { href: "/groups", icon: "groups", translationKey: "groups" },
  { href: "/tools", icon: "tools", translationKey: "tools" },
  { href: "/profile", icon: "profile", translationKey: "profile" },
] as const;

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex max-w-svw border-t border-velvet-800 bg-velvet-950/95 backdrop-blur-md pb-[max(env(safe-area-inset-bottom),0px)] lg:hidden"
      aria-label="Navegación móvil"
      style={{ touchAction: "manipulation" }}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/tools"
            ? toolPaths.some((p) => pathname.includes(p))
            : pathname.includes(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`focus-ring relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-all duration-200 ${
              isActive
                ? "text-gold-400"
                : "text-velvet-600 hover:text-velvet-400"
            }`}
          >
            {/* Active top bar */}
            {isActive && (
              <span className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            )}
            {/* Icon container with subtle bg when active */}
            <span className={`flex h-7 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
              isActive ? "bg-gold-500/10" : ""
            }`}>
              <MobileNavIcon name={item.icon} active={isActive} />
            </span>
            <span className={`transition-all duration-200 ${isActive ? "text-gold-400" : ""}`}>
              {t(item.translationKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavIcon({ name, active }: { name: string; active: boolean }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.5 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "tools":
      return (
        <svg {...props}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
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
