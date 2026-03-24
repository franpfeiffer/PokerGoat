import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Tools",
};

export default async function ToolsPage() {
  const tNav = await getTranslations("nav");
  const tGoatEye = await getTranslations("goatEye");
  const tSidePots = await getTranslations("sidePots");

  const toolData = [
    {
      href: "/goat-eye" as const,
      title: tNav("goatEye"),
      subtitle: tGoatEye("subtitle"),
      icon: "goatEye" as const,
    },
    {
      href: "/side-pots" as const,
      title: tNav("sidePots"),
      subtitle: tSidePots("subtitle"),
      icon: "sidePots" as const,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{tNav("tools")}</h1>
      <div className="grid gap-3">
        {toolData.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="focus-ring group flex items-center gap-4 rounded-xl border border-velvet-700/60 bg-velvet-800/50 px-4 py-4 transition-colors hover:border-gold-500/30 hover:bg-velvet-800"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-velvet-700/50 text-gold-400 transition-colors group-hover:bg-gold-500/10">
              <ToolIcon name={tool.icon} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-velvet-100">
                {tool.title}
              </p>
              <p className="mt-0.5 text-xs text-velvet-400 line-clamp-1">
                {tool.subtitle}
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-auto shrink-0 text-velvet-500 transition-transform group-hover:translate-x-0.5 group-hover:text-velvet-300"
              aria-hidden
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ToolIcon({ name }: { name: string }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
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
    default:
      return null;
  }
}
