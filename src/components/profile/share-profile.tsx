"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatProfitLoss } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { getRank } from "@/lib/rank";
import type { AchievementInput, AchievementId } from "@/lib/achievements";
import { getUnlockedAchievements } from "@/lib/achievements";

interface ShareProfileProps {
  displayName: string;
  avatarUrl?: string | null;
  totalProfit: number;
  nightsPlayed: number;
  winRate: number;
  achievementData: AchievementInput | null;
}

export function ShareProfile({
  displayName,
  avatarUrl,
  totalProfit,
  nightsPlayed,
  winRate,
  achievementData,
}: ShareProfileProps) {
  const t = useTranslations("share");
  const locale = useLocale();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  const moneyLocale = locale === "es" ? "es-AR" : "en-US";
  const rank = getRank(totalProfit);
  const unlocked = achievementData ? getUnlockedAchievements(achievementData) : [];

  const getAvatarBase64 = useCallback(async () => {
    if (!avatarUrl) return null;
    if (avatarBase64) return avatarBase64;
    try {
      const res = await fetch(avatarUrl);
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return avatarUrl;
    }
  }, [avatarUrl, avatarBase64]);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    const b64 = await getAvatarBase64();
    setAvatarBase64(b64);
    // Wait a tick for React to re-render with base64 avatar
    await new Promise((r) => setTimeout(r, 100));
    const { toPng } = await import("html-to-image");
    return toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
  }, [getAvatarBase64]);

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "poker-profile.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `${displayName} - PokerGoat`, files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "poker-profile.png";
        a.click();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const profitColor = totalProfit > 0 ? "#34d375" : totalProfit < 0 ? "#f05c6e" : "#6b6080";
  const profitSign = totalProfit > 0 ? "+" : "";

  return (
    <>
      {/* Off-screen card for image capture */}
      <div
        ref={cardRef}
        style={{
          width: 380,
          background: "linear-gradient(160deg, #0f0a1e 0%, #08080d 60%, #0a0d1a 100%)",
          padding: "28px 24px 24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {/* Gold top line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #c8a438, transparent)", marginBottom: 24 }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          {(avatarBase64 ?? avatarUrl) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarBase64 ?? avatarUrl!} alt="" width={56} height={56} style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(200,164,56,0.3)" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#1e1a2e", border: "2px solid rgba(200,164,56,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#c8a438", fontWeight: 700 }}>
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#f5f0e8", margin: 0 }}>{displayName}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, padding: "2px 10px", borderRadius: 20, background: rank.bgColor.replace("/10", "").replace("bg-", "").includes("blue") ? "rgba(59,130,246,0.1)" : rank.bgColor.replace("/10", "").replace("bg-", "").includes("orange") ? "rgba(249,115,22,0.1)" : rank.bgColor.replace("/10", "").replace("bg-", "").includes("purple") ? "rgba(168,85,247,0.1)" : "rgba(200,164,56,0.1)", border: `1px solid ${rank.borderColor.includes("blue") ? "rgba(59,130,246,0.3)" : rank.borderColor.includes("orange") ? "rgba(249,115,22,0.3)" : rank.borderColor.includes("purple") ? "rgba(168,85,247,0.3)" : "rgba(200,164,56,0.3)"}` }}>
              <span style={{ fontSize: 13 }}>{rank.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: rank.color.includes("blue") ? "#60a5fa" : rank.color.includes("orange") ? "#fb923c" : rank.color.includes("purple") ? "#c084fc" : "#c8a438" }}>{rank.id.charAt(0).toUpperCase() + rank.id.slice(1)}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          {[
            { label: "Total Profit", value: `${profitSign}${formatProfitLoss(totalProfit, moneyLocale, DEFAULT_CURRENCY)}`, color: profitColor },
            { label: "Nights", value: String(nightsPlayed), color: "#f5f0e8" },
            { label: "Win Rate", value: `${Math.round(winRate * 100)}%`, color: winRate > 0.5 ? "#34d375" : winRate > 0 ? "#c8a438" : "#6b6080" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <p style={{ fontSize: 10, color: "#6b6080", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color, margin: 0, tabularNums: true } as React.CSSProperties}>{value}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        {unlocked.length > 0 && (
          <div>
            <p style={{ fontSize: 10, color: "#6b6080", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.15em" }}>Achievements</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {unlocked.slice(0, 8).map((a) => (
                <span key={a.id} style={{ fontSize: 18, lineHeight: 1 }}>{a.icon}</span>
              ))}
              {unlocked.length > 8 && (
                <span style={{ fontSize: 11, color: "#6b6080", alignSelf: "center" }}>+{unlocked.length - 8}</span>
              )}
            </div>
          </div>
        )}

        {/* PokerGoat branding */}
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <p style={{ fontSize: 9, color: "#3a3050", margin: 0, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>PokerGoat</p>
        </div>

        {/* Gold bottom line */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(200,164,56,0.3), transparent)", marginTop: 8 }} />
      </div>

      <Button
        size="sm"
        variant="secondary"
        onClick={handleShare}
        disabled={isGenerating}
        className="min-h-11 w-full sm:min-h-10 sm:w-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mr-1.5" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {isGenerating ? t("generating") : t("shareProfile")}
      </Button>
    </>
  );
}
