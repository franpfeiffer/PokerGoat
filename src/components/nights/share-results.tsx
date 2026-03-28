"use client";

import { useState } from "react";
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

async function drawResultsCard(opts: {
  nightName: string;
  date: string;
  results: ResultRow[];
  locale: string;
  currency: string;
}): Promise<string> {
  const { results, nightName, date, locale, currency } = opts;

  const ROW_H = 44;
  const PADDING = 32;
  const HEADER_H = 110;
  const WINNER_H = 70;
  const FOOTER_H = 40;
  const W = 480;
  const H = HEADER_H + WINNER_H + (results.length - 1) * ROW_H + FOOTER_H + PADDING;

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

  // Header
  ctx.fillStyle = "#c8a438";
  ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("POKERGOAT", W / 2, 28);

  ctx.fillStyle = "#f5f0e8";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(nightName, W / 2, 58);

  ctx.fillStyle = "#6b6080";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillText(date, W / 2, 78);

  // Winner box
  const winner = results[0];
  if (winner) {
    const wx = PADDING;
    const wy = HEADER_H;
    const ww = W - PADDING * 2;
    const wh = WINNER_H - 10;

    roundRect(ctx, wx, wy, ww, wh, 12);
    const winnerBg = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
    winnerBg.addColorStop(0, "rgba(200,164,56,0.12)");
    winnerBg.addColorStop(1, "rgba(200,164,56,0.04)");
    ctx.fillStyle = winnerBg;
    ctx.fill();
    ctx.strokeStyle = "rgba(200,164,56,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#f5f0e8";
    ctx.textAlign = "left";
    ctx.fillText(winner.displayName, wx + 16, wy + 26);

    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#c8a438";
    ctx.fillText("Ganador de la noche", wx + 16, wy + 46);

    ctx.font = "bold 17px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#34d375";
    ctx.textAlign = "right";
    ctx.fillText(formatProfitLoss(winner.profitLoss, locale, currency), wx + ww - 16, wy + 32);
  }

  // Rest of results
  ctx.textAlign = "left";
  results.slice(1).forEach((r, i) => {
    const ry = HEADER_H + WINNER_H + i * ROW_H;
    const rx = PADDING;
    const rw = W - PADDING * 2;

    if (r.rank <= 3) {
      roundRect(ctx, rx, ry, rw, ROW_H - 6, 9);
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = "#6b6080";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`#${r.rank}`, rx + 20, ry + ROW_H / 2 + 1);

    ctx.fillStyle = "#c8bfdb";
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(r.displayName, rx + 44, ry + ROW_H / 2 + 1);

    ctx.fillStyle = r.profitLoss > 0 ? "#34d375" : r.profitLoss < 0 ? "#f05c6e" : "#6b6080";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(formatProfitLoss(r.profitLoss, locale, currency), rx + rw - 8, ry + ROW_H / 2 + 1);
  });

  // Bottom gold line
  const botLine = ctx.createLinearGradient(0, 0, W, 0);
  botLine.addColorStop(0, "transparent");
  botLine.addColorStop(0.5, "rgba(200,164,56,0.3)");
  botLine.addColorStop(1, "transparent");
  ctx.fillStyle = botLine;
  ctx.fillRect(0, H - 2, W, 2);

  return canvas.toDataURL("image/png");
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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await drawResultsCard({ nightName, date, results, locale, currency });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "poker-results.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `${nightName} - PokerGoat`, files: [file] });
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

  return (
    <div className="space-y-3">
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
