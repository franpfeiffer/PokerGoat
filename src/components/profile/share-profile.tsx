"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatProfitLoss } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { getRank } from "@/lib/rank";
import type { AchievementInput } from "@/lib/achievements";
import { getUnlockedAchievements } from "@/lib/achievements";

interface ShareProfileProps {
  displayName: string;
  avatarUrl?: string | null;
  totalProfit: number;
  nightsPlayed: number;
  winRate: number;
  achievementData: AchievementInput | null;
}

const RANK_COLORS: Record<string, string> = {
  plankton: "#34d399",
  fish: "#60a5fa",
  shark: "#a78bfa",
  megalodon: "#c8a438",
};

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawCard(opts: {
  displayName: string;
  avatarUrl?: string | null;
  totalProfit: number;
  nightsPlayed: number;
  winRate: number;
  rankId: string;
  rankName: string;
  profitLabel: string;
  nightsLabel: string;
  winRateLabel: string;
  achievementIcons: string[];
}): Promise<string> {
  const W = 760;
  const H = 420;
  const DPR = 2;

  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);

  // Background
  const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
  bg.addColorStop(0, "#0f0a1e");
  bg.addColorStop(0.6, "#08080d");
  bg.addColorStop(1, "#0a0d1a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Top gold line
  const topLine = ctx.createLinearGradient(0, 0, W, 0);
  topLine.addColorStop(0, "transparent");
  topLine.addColorStop(0.5, "#c8a438");
  topLine.addColorStop(1, "transparent");
  ctx.fillStyle = topLine;
  ctx.fillRect(0, 0, W, 2);

  // Avatar
  const AVATAR_SIZE = 80;
  const AVATAR_X = 40;
  const AVATAR_Y = 40;

  if (opts.avatarUrl) {
    try {
      // Try fetching as blob to avoid CORS
      const res = await fetch(opts.avatarUrl);
      const blob = await res.blob();
      const b64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const img = await loadImage(b64);
      ctx.save();
      ctx.beginPath();
      ctx.arc(AVATAR_X + AVATAR_SIZE / 2, AVATAR_Y + AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, AVATAR_X, AVATAR_Y, AVATAR_SIZE, AVATAR_SIZE);
      ctx.restore();
    } catch {
      // fallback: initial letter circle
      drawInitialCircle(ctx, opts.displayName, AVATAR_X, AVATAR_Y, AVATAR_SIZE);
    }
  } else {
    drawInitialCircle(ctx, opts.displayName, AVATAR_X, AVATAR_Y, AVATAR_SIZE);
  }

  // Avatar gold border
  ctx.beginPath();
  ctx.arc(AVATAR_X + AVATAR_SIZE / 2, AVATAR_Y + AVATAR_SIZE / 2, AVATAR_SIZE / 2 + 1, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(200,164,56,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Name
  ctx.fillStyle = "#f5f0e8";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(opts.displayName, AVATAR_X + AVATAR_SIZE + 16, AVATAR_Y + 28);

  // Rank pill
  const rankColor = RANK_COLORS[opts.rankId] ?? "#c8a438";
  const rankText = opts.rankName;
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  const rankW = ctx.measureText(rankText).width + 20;
  const pillX = AVATAR_X + AVATAR_SIZE + 16;
  const pillY = AVATAR_Y + 40;
  roundRect(ctx, pillX, pillY, rankW, 22, 11);
  ctx.fillStyle = hexToRgba(rankColor, 0.12);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(rankColor, 0.35);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = rankColor;
  ctx.textAlign = "center";
  ctx.fillText(rankText, pillX + rankW / 2, pillY + 15);
  ctx.textAlign = "left";

  // Stats cards
  const stats = [
    { label: opts.profitLabel, value: `${opts.totalProfit > 0 ? "+" : ""}${formatProfitLoss(opts.totalProfit, "es-AR", DEFAULT_CURRENCY)}`, color: opts.totalProfit > 0 ? "#34d375" : opts.totalProfit < 0 ? "#f05c6e" : "#6b6080" },
    { label: opts.nightsLabel, value: String(opts.nightsPlayed), color: "#f5f0e8" },
    { label: opts.winRateLabel, value: `${Math.round(opts.winRate * 100)}%`, color: opts.winRate > 0.5 ? "#34d375" : opts.winRate > 0 ? "#c8a438" : "#6b6080" },
  ];

  const CARD_Y = 160;
  const CARD_H = 90;
  const CARD_GAP = 12;
  const CARD_W = (W - 80 - CARD_GAP * 2) / 3;

  stats.forEach(({ label, value, color }, i) => {
    const cx = 40 + i * (CARD_W + CARD_GAP);
    roundRect(ctx, cx, CARD_Y, CARD_W, CARD_H, 10);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#6b6080";
    ctx.font = "10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label.toUpperCase(), cx + CARD_W / 2, CARD_Y + 24);

    ctx.fillStyle = color;
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(value, cx + CARD_W / 2, CARD_Y + 58);
    ctx.textAlign = "left";
  });

  // Achievements
  if (opts.achievementIcons.length > 0) {
    ctx.fillStyle = "#6b6080";
    ctx.font = "10px system-ui, -apple-system, sans-serif";
    ctx.fillText("LOGROS", 40, 290);

    ctx.font = "22px system-ui, -apple-system, sans-serif";
    opts.achievementIcons.slice(0, 10).forEach((icon, i) => {
      ctx.fillText(icon, 40 + i * 32, 318);
    });
  }

  // PokerGoat branding
  ctx.fillStyle = "#3a3050";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.letterSpacing = "0.2em";
  ctx.fillText("POKERGOAT", W - 40, H - 20);
  ctx.textAlign = "left";

  // Bottom gold line
  const botLine = ctx.createLinearGradient(0, 0, W, 0);
  botLine.addColorStop(0, "transparent");
  botLine.addColorStop(0.5, "rgba(200,164,56,0.3)");
  botLine.addColorStop(1, "transparent");
  ctx.fillStyle = botLine;
  ctx.fillRect(0, H - 2, W, 2);

  return canvas.toDataURL("image/png");
}

function drawInitialCircle(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#1e1a2e";
  ctx.fill();
  ctx.fillStyle = "#c8a438";
  ctx.font = `bold ${size * 0.4}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((name[0] ?? "?").toUpperCase(), x + size / 2, y + size / 2);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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
  const [isGenerating, setIsGenerating] = useState(false);

  const rank = getRank(totalProfit);
  const unlocked = achievementData ? getUnlockedAchievements(achievementData) : [];
  const rankName = rank.id.charAt(0).toUpperCase() + rank.id.slice(1);

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await drawCard({
        displayName,
        avatarUrl,
        totalProfit,
        nightsPlayed,
        winRate,
        rankId: rank.id,
        rankName,
        profitLabel: locale === "es" ? "Ganancia" : "Profit",
        nightsLabel: locale === "es" ? "Noches" : "Nights",
        winRateLabel: "Win Rate",
        achievementIcons: unlocked.map((a) => a.icon),
      });

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

  return (
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
  );
}
