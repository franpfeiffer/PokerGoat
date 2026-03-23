"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatProfitLoss } from "@/lib/utils/currency";

interface ResultRow {
  rank: number;
  displayName: string;
  profitLoss: number;
}

interface ShareResultsProps {
  nightName: string;
  date: string;
  results: ResultRow[];
  locale: string;
  currency: string;
}

export function ShareResults({
  nightName,
  date,
  results,
  locale,
  currency,
}: ShareResultsProps) {
  const t = useTranslations("share");
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: "#08080d",
    });
  }, []);

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "poker-results.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${nightName} - PokerGoat`,
          files: [file],
        });
      } else {
        // Fallback: download
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "poker-results.png";
        a.click();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const medalEmoji = (rank: number) => {
    if (rank === 1) return "\ud83e\udd47";
    if (rank === 2) return "\ud83e\udd48";
    if (rank === 3) return "\ud83e\udd49";
    return `#${rank}`;
  };

  return (
    <div className="space-y-3">
      {/* Card to capture */}
      <div
        ref={cardRef}
        className="rounded-xl border border-velvet-700 bg-velvet-900 p-5"
        style={{ width: 360 }}
      >
        <div className="mb-4 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gold-400">
            PokerGoat
          </p>
          <p className="mt-1 font-display text-lg font-bold text-velvet-50">
            {nightName}
          </p>
          <p className="text-xs text-velvet-400">{date}</p>
        </div>
        <div className="space-y-1.5">
          {results.map((r) => (
            <div
              key={r.rank}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                r.rank <= 3
                  ? "bg-gold-500/5 border border-gold-500/10"
                  : "border border-transparent"
              }`}
            >
              <span className="w-8 text-center text-sm">
                {medalEmoji(r.rank)}
              </span>
              <span className="flex-1 truncate text-velvet-100">
                {r.displayName}
              </span>
              <span
                className={`font-semibold tabular-nums ${
                  r.profitLoss > 0
                    ? "text-profit"
                    : r.profitLoss < 0
                      ? "text-loss"
                      : "text-velvet-400"
                }`}
              >
                {formatProfitLoss(r.profitLoss, locale, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button
        size="sm"
        variant="secondary"
        onClick={handleShare}
        disabled={isGenerating}
        className="min-h-11 w-full sm:min-h-10 sm:w-auto"
      >
        {isGenerating ? t("generating") : t("share")}
      </Button>
    </div>
  );
}
