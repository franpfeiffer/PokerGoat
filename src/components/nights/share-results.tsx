"use client";

import { useRef, useState, useCallback } from "react";
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
  groupId?: string;
}

export function ShareResults({
  nightName,
  date,
  results,
  locale,
  currency,
  groupId: _groupId,
}: ShareResultsProps) {
  const t = useTranslations("share");
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    const { toPng } = await import("html-to-image");
    return toPng(cardRef.current, {
      pixelRatio: 3,
      cacheBust: true,
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

  const winner = results[0];

  return (
    <div className="space-y-3">
      {/* Card to capture — off-screen rendered for image generation */}
      <div
        ref={cardRef}
        style={{
          width: 400,
          background: "linear-gradient(160deg, #0f0a1e 0%, #08080d 60%, #0a0d1a 100%)",
          padding: "28px 24px 24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {/* Top gold line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #c8a438, transparent)", marginBottom: 24 }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c8a438", margin: 0 }}>
            PokerGoat
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#f5f0e8", margin: "6px 0 4px", lineHeight: 1.2 }}>
            {nightName}
          </p>
          <p style={{ fontSize: 11, color: "#6b6080", margin: 0 }}>{date}</p>
        </div>

        {/* Winner highlight */}
        {winner && (
          <div style={{
            background: "linear-gradient(135deg, rgba(200,164,56,0.12) 0%, rgba(200,164,56,0.04) 100%)",
            border: "1px solid rgba(200,164,56,0.25)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>🥇</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#f5f0e8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {winner.displayName}
              </p>
              <p style={{ fontSize: 11, color: "#c8a438", margin: "2px 0 0", fontWeight: 500 }}>Ganador de la noche</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#34d375", whiteSpace: "nowrap" }}>
              {formatProfitLoss(winner.profitLoss, locale, currency)}
            </span>
          </div>
        )}

        {/* Rest of results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {results.slice(1).map((r) => (
            <div
              key={r.rank}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                background: r.rank === 2 || r.rank === 3
                  ? "rgba(255,255,255,0.03)"
                  : "transparent",
                border: r.rank === 2 || r.rank === 3
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid transparent",
              }}
            >
              <span style={{ width: 24, textAlign: "center", fontSize: 16, lineHeight: 1 }}>
                {medalEmoji(r.rank)}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: "#c8bfdb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.displayName}
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: r.profitLoss > 0 ? "#34d375" : r.profitLoss < 0 ? "#f05c6e" : "#6b6080",
                whiteSpace: "nowrap",
              }}>
                {formatProfitLoss(r.profitLoss, locale, currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom gold line */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(200,164,56,0.3), transparent)", marginTop: 20 }} />
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
