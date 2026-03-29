"use client";

import { useTranslations } from "next-intl";
import { getRank, getNextRank, getRankProgress } from "@/lib/rank";
import { formatCurrency } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { useState } from "react";

interface RankBadgeProps {
  totalProfit: number;
  locale: string;
  size?: "sm" | "md";
}

const rankVisuals = {
  plankton: {
    color: "#6ee7b7",
    colorStrong: "#34d399",
    bar: "#34d399",
    border: "rgba(52,211,153,0.2)",
    borderHover: "rgba(52,211,153,0.38)",
    bg: "rgba(52,211,153,0.05)",
    glow: "rgba(52,211,153,0.15)",
    glowHover: "rgba(52,211,153,0.25)",
  },
  fish: {
    color: "#93c5fd",
    colorStrong: "#60a5fa",
    bar: "#60a5fa",
    border: "rgba(96,165,250,0.22)",
    borderHover: "rgba(96,165,250,0.4)",
    bg: "rgba(59,130,246,0.06)",
    glow: "rgba(96,165,250,0.18)",
    glowHover: "rgba(96,165,250,0.28)",
  },
  shark: {
    color: "#c4b5fd",
    colorStrong: "#a78bfa",
    bar: "#a78bfa",
    border: "rgba(167,139,250,0.22)",
    borderHover: "rgba(167,139,250,0.4)",
    bg: "rgba(139,92,246,0.06)",
    glow: "rgba(167,139,250,0.18)",
    glowHover: "rgba(167,139,250,0.3)",
  },
  megalodon: {
    color: "#dab454",
    colorStrong: "#c8a438",
    bar: "#c8a438",
    border: "rgba(200,164,56,0.28)",
    borderHover: "rgba(200,164,56,0.5)",
    bg: "rgba(200,164,56,0.07)",
    glow: "rgba(200,164,56,0.2)",
    glowHover: "rgba(200,164,56,0.35)",
  },
} as const;

function RankIcon({ id, color, size = 28 }: { id: string; color: string; size?: number }) {
  const s = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (id) {
    case "plankton":
      // Microscopic organism — cell with flagella floating in the deep
      return (
        <svg {...s}>
          <ellipse cx="12" cy="11" rx="4" ry="5" />
          <circle cx="10.5" cy="10" r="0.8" fill={color} stroke="none" />
          <circle cx="13" cy="12.5" r="0.5" fill={color} stroke="none" />
          {/* Flagella */}
          <path d="M12 16c0 2 1 3 0 5" strokeWidth="1" />
          <path d="M10 15.5c-1 1.5-2 2-2 4" strokeWidth="1" />
          <path d="M14 15.5c1 1.5 2 2 2 4" strokeWidth="1" />
          {/* Membrane detail */}
          <path d="M8.5 8.5c1-1.5 5-1.5 6 0" strokeWidth="1" strokeOpacity="0.5" />
        </svg>
      );
    case "fish":
      // Clean tropical fish with fins and tail
      return (
        <svg {...s}>
          {/* Tail fin */}
          <path d="M4 8L2 5v14l2-3" />
          {/* Body */}
          <ellipse cx="13" cy="12" rx="7" ry="5" />
          {/* Dorsal fin */}
          <path d="M10 7c1-2 4-2 5-1" />
          {/* Pectoral fin */}
          <path d="M12 12c0 2-2 3-3 3" />
          {/* Eye */}
          <circle cx="18" cy="11" r="1.2" fill={color} stroke="none" />
          <circle cx="18.4" cy="10.6" r="0.4" fill="rgba(0,0,0,0.4)" stroke="none" />
          {/* Stripe */}
          <path d="M14 7.5v9" strokeWidth="1" strokeOpacity="0.35" />
        </svg>
      );
    case "shark":
      // Sleek great white — side profile, sharp and clean
      return (
        <svg {...s}>
          {/* Body */}
          <path d="M2 13c0 0 4-7 12-7c4 0 7 2.5 8 5c-1 3-4 5-8 5C8 16 2 13 2 13z" />
          {/* Tail */}
          <path d="M2 13L0 9M2 13L0 17" />
          {/* Dorsal fin */}
          <path d="M10 6L13 2L15 6" />
          {/* Pectoral fin */}
          <path d="M12 13l-2 4" />
          {/* Gill */}
          <path d="M16 8.5c0 2-0.5 4-0.5 4" strokeWidth="1" strokeOpacity="0.5" />
          {/* Eye */}
          <circle cx="19.5" cy="11" r="1" fill={color} stroke="none" />
          <circle cx="19.8" cy="10.7" r="0.35" fill="rgba(0,0,0,0.5)" stroke="none" />
          {/* Mouth */}
          <path d="M21 13c-0.5 1-1.5 1.5-3 1.5" strokeWidth="1" />
        </svg>
      );
    case "megalodon":
      // Massive prehistoric jaw seen head-on — iconic open mouth with rows of serrated teeth
      return (
        <svg {...s} viewBox="0 0 24 24">
          {/* Upper jaw arc */}
          <path d="M2 10 Q12 2 22 10" strokeWidth="1.8" />
          {/* Lower jaw arc */}
          <path d="M2 10 Q12 22 22 10" strokeWidth="1.8" />
          {/* Upper teeth — serrated row */}
          <path d="M5 9.5 L6.5 13 L8 9 L9.5 13 L11 9 L12 13 L13 9 L14.5 13 L16 9 L17.5 13 L19 9.5"
            strokeWidth="1.4" strokeLinejoin="round" />
          {/* Lower teeth — shorter counter row */}
          <path d="M6.5 11 L7.5 8.5 L9 11 L10.5 8.5 L12 11 L13.5 8.5 L15 11 L16.5 8.5 L17.5 11"
            strokeWidth="1.1" strokeLinejoin="round" strokeOpacity="0.7" />
          {/* Nostril dots */}
          <circle cx="10" cy="7" r="0.6" fill={color} stroke="none" />
          <circle cx="14" cy="7" r="0.6" fill={color} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

export function RankBadge({ totalProfit, locale, size = "md" }: RankBadgeProps) {
  const t = useTranslations("rank");
  const rank = getRank(totalProfit);
  const nextRank = getNextRank(totalProfit);
  const progress = getRankProgress(totalProfit);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hovered, setHovered] = useState(false);

  const moneyLocale = locale === "es" ? "es-AR" : "en-US";
  const rankName = t(rank.id);
  const nextRankName = nextRank ? t(nextRank.id) : null;
  const v = rankVisuals[rank.id];
  const remaining = nextRank ? nextRank.minProfit - Math.max(totalProfit, 0) : 0;

  if (size === "sm") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "6px",
          border: `1px solid ${v.border}`,
          background: v.bg,
          padding: "1px 7px",
          fontSize: "11px",
          fontWeight: 600,
          color: v.color,
        }}
      >
        {rankName}
      </span>
    );
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setShowTooltip((s) => !s)}
        onBlur={() => setShowTooltip(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="focus-ring relative w-full overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          border: `1px solid ${hovered ? v.borderHover : v.border}`,
          background: v.bg,
          boxShadow: hovered
            ? `0 0 28px 0 ${v.glowHover}, inset 0 1px 0 ${v.border}`
            : `0 0 0 0 transparent, inset 0 1px 0 ${v.border}`,
          padding: "16px 20px",
        }}
      >
        {/* Top shimmer line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${v.colorStrong}60 40%, ${v.colorStrong}80 50%, ${v.colorStrong}60 60%, transparent 100%)`,
            opacity: hovered ? 1 : 0.6,
            transition: "opacity 0.3s",
          }}
        />

        <div className="relative flex flex-col items-center gap-3">
          {/* Icon */}
          <div
            className="rounded-2xl p-3"
            style={{
              background: `${v.colorStrong}10`,
              border: `1px solid ${v.border}`,
            }}
          >
            <RankIcon id={rank.id} color={v.colorStrong} size={30} />
          </div>

          {/* Rank name + MAX badge */}
          <div className="flex items-center gap-2">
            <span
              className="font-display text-xl font-bold leading-none"
              style={{ color: v.color }}
            >
              {rankName}
            </span>
            {!nextRank && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-bold leading-none"
                style={{
                  background: `${v.colorStrong}15`,
                  border: `1px solid ${v.colorStrong}35`,
                  color: v.color,
                  letterSpacing: "0.1em",
                }}
              >
                MAX
              </span>
            )}
          </div>

          {/* Progress bar + next rank */}
          {nextRank && nextRankName ? (
            <div className="flex w-full flex-col items-center gap-1.5">
              <div
                className="h-[3px] w-full overflow-hidden rounded-full"
                style={{ background: `${v.colorStrong}15` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress * 100}%`,
                    background: `linear-gradient(90deg, ${v.bar}80, ${v.bar})`,
                    boxShadow: `0 0 8px ${v.bar}90`,
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                  <path
                    d="M1.5 4.5h6M5 1.5l3 3-3 3"
                    stroke={v.colorStrong}
                    strokeOpacity="0.5"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[11px]" style={{ color: v.color, opacity: 0.5 }}>
                  {nextRankName}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: v.color, opacity: 0.45 }}>
              Rango máximo alcanzado
            </p>
          )}
        </div>
      </button>

      {/* Tooltip */}
      {showTooltip && nextRank && nextRankName && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 animate-fade-in whitespace-nowrap">
          <div
            className="rounded-xl px-4 py-2.5 shadow-xl shadow-black/60"
            style={{
              border: `1px solid ${v.border}`,
              background: "#0c0c12",
            }}
          >
            <p className="text-xs" style={{ color: v.color }}>
              {t("needForNext", {
                amount: formatCurrency(Math.max(remaining, 0), moneyLocale, DEFAULT_CURRENCY),
                rank: nextRankName,
              })}
            </p>
          </div>
          <div
            className="mx-auto mt-[-5px] h-2.5 w-2.5 rotate-45"
            style={{
              background: "#0c0c12",
              border: `1px solid ${v.border}`,
              borderTop: "none",
              borderLeft: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}
