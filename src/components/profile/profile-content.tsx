"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { updateDisplayName, updateAvatar, updateBankAlias } from "@/lib/actions/profile";
import { formatProfitLoss } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { ProfitChart } from "./profit-chart";
import { GroupComparisonCard } from "./group-comparison-card";
import { AchievementBadges } from "./achievement-badges";
import { RankBadge } from "./rank-badge";
import { PersonalRecordsCard } from "./personal-records-card";
import { ShareProfile } from "./share-profile";
import type { GroupComparisonStats } from "@/lib/db/queries/users";
import type { AchievementInput } from "@/lib/achievements";

interface ProfileContentProps {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  googleImage?: string | null;
  bankAlias?: string | null;
  stats: {
    nightsPlayed: number;
    totalProfit: number;
    winRate: number;
  };
  profitHistory: { date: string; profitLoss: number; cumulative: number }[];
  streak: { type: "winning" | "losing" | "none"; count: number };
  groupComparison: GroupComparisonStats | null;
  achievementData: AchievementInput | null;
  personalRecords: {
    biggestWin: number;
    worstNight: number;
    biggestWinNightId: string | null;
    worstNightId: string | null;
    biggestWinDate: string | null;
    worstNightDate: string | null;
    longestWinStreak: number;
    groupId?: string;
  } | null;
  locale: string;
  onProfileChange?: (patch: { displayName?: string; avatarUrl?: string | null; bankAlias?: string | null }) => void;
}

export function ProfileContent({
  userId,
  displayName,
  email,
  avatarUrl,
  googleImage,
  bankAlias,
  stats,
  profitHistory,
  streak,
  groupComparison,
  achievementData,
  personalRecords,
  locale,
  onProfileChange,
}: ProfileContentProps) {
  const t = useTranslations("profile");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [aliasCopied, setAliasCopied] = useState(false);
  const aliasInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const imageUrl = localPreview || avatarUrl || googleImage;

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingAlias && aliasInputRef.current) {
      aliasInputRef.current.focus();
      aliasInputRef.current.select();
    }
  }, [isEditingAlias]);

  function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const newName = formData.get("displayName") as string;
      const result = await updateDisplayName(userId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditingName(false);
        onProfileChange?.({ displayName: newName });
      }
    });
  }

  function handleResetAvatar() {
    if (!googleImage) return;
    setError(null);
    setLocalPreview(googleImage);
    startTransition(async () => {
      const result = await updateAvatar(userId, googleImage);
      if (result.error) {
        setLocalPreview(null);
        setError(result.error);
      } else {
        window.dispatchEvent(new Event("profile-updated"));
        onProfileChange?.({ avatarUrl: googleImage });
      }
    });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const imgSrc = reader.result as string;

      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;

        // Center crop
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        // Show preview immediately
        setLocalPreview(dataUrl);

        startTransition(async () => {
          const result = await updateAvatar(userId, dataUrl);
          if (result.error) {
            setLocalPreview(null);
            setError(result.error);
          } else {
            window.dispatchEvent(new Event("profile-updated"));
            onProfileChange?.({ avatarUrl: dataUrl });
          }
        });
      };
      img.onerror = () => {
        setError("No se pudo procesar la imagen");
      };
      img.src = imgSrc;
    };
    reader.onerror = () => {
      setError("No se pudo leer el archivo");
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsEditingName(false);
      setError(null);
    }
  }

  function handleAliasSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const value = (formData.get("bankAlias") as string).trim();
    startTransition(async () => {
      const result = await updateBankAlias(userId, value || null);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditingAlias(false);
        onProfileChange?.({ bankAlias: value || null });
      }
    });
  }

  function handleCopyAlias() {
    if (!bankAlias) return;
    navigator.clipboard.writeText(bankAlias).then(() => {
      setAliasCopied(true);
      setTimeout(() => setAliasCopied(false), 2000);
    });
  }

  const profitColor =
    stats.totalProfit > 0
      ? "text-profit"
      : stats.totalProfit < 0
        ? "text-loss"
        : "text-even";

  const profitBg =
    stats.totalProfit > 0
      ? "bg-profit/5"
      : stats.totalProfit < 0
        ? "bg-loss/5"
        : "bg-velvet-800/50";

  const winRateColor =
    stats.winRate > 0.5
      ? "text-profit"
      : stats.winRate > 0
        ? "text-gold-400"
        : "text-even";

  return (
    <div className="space-y-3">
      {/* Hero Card: Avatar + Identity */}
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center py-8 px-4 sm:py-10 sm:px-6">
          {/* Avatar with gold ring — clickable to change photo */}
          <div className="animate-fade-in">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="focus-ring group relative rounded-full disabled:opacity-50"
              aria-label={t("changeAvatar")}
            >
              <Avatar
                src={imageUrl}
                name={displayName}
                size="2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* Name + Edit */}
          <div className="mt-5 flex flex-col items-center gap-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {isEditingName ? (
              <form
                onSubmit={handleNameSubmit}
                onKeyDown={handleEditKeyDown}
                className="animate-scale-in flex flex-col items-center gap-3 w-full max-w-xs"
              >
                <div className="w-full rounded-xl border border-velvet-600 bg-velvet-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm">
                  <Input
                    ref={inputRef}
                    label={t("displayName")}
                    name="displayName"
                    defaultValue={displayName}
                    required
                    className="text-center"
                  />
                  {error && (
                    <p role="alert" className="mt-2 text-center text-xs text-loss">
                      {error}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2 justify-center">
                    <Button type="submit" size="sm" disabled={isPending}>
                      {t("save")}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsEditingName(false);
                        setError(null);
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-velvet-50 tracking-tight">
                  {displayName}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="focus-ring group rounded-full p-1.5 text-velvet-500 hover:text-gold-400 hover:bg-velvet-800/60 transition-colors"
                  aria-label={t("editName")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform group-hover:scale-110"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-sm text-velvet-400">{email}</p>
            {streak.type !== "none" && streak.count >= 2 && (
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  streak.type === "winning"
                    ? "bg-profit/15 text-profit"
                    : "bg-loss/15 text-loss"
                }`}
              >
                {streak.type === "winning" ? "🔥" : "❄️"}
                {streak.count} {streak.type === "winning" ? t("streakWinning") : t("streakLosing")}
              </span>
            )}
          </div>

          {/* Rank */}
          <div className="mt-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <RankBadge totalProfit={stats.totalProfit} locale={locale} />
          </div>

          {/* Bank Alias / CVU */}
          <div className="mt-3 w-full max-w-xs animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {isEditingAlias ? (
              <form
                onSubmit={handleAliasSubmit}
                onKeyDown={(e) => { if (e.key === "Escape") { setIsEditingAlias(false); setError(null); } }}
                className="animate-scale-in flex flex-col items-center gap-3 w-full"
              >
                <div className="w-full rounded-xl border border-velvet-600 bg-velvet-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm">
                  <Input
                    ref={aliasInputRef}
                    label={t("bankAliasLabel")}
                    name="bankAlias"
                    defaultValue={bankAlias ?? ""}
                    placeholder={t("bankAliasPlaceholder")}
                    maxLength={200}
                    className="text-center"
                  />
                  {error && (
                    <p role="alert" className="mt-2 text-center text-xs text-loss">
                      {error}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2 justify-center">
                    <Button type="submit" size="sm" disabled={isPending}>
                      {t("save")}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => { setIsEditingAlias(false); setError(null); }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {bankAlias ? (
                  <>
                    <span className="text-xs text-velvet-400 mr-1">{t("bankAliasLabel")}:</span>
                    <span className="text-sm font-mono text-velvet-200 truncate max-w-[140px]">{bankAlias}</span>
                    <button
                      type="button"
                      onClick={handleCopyAlias}
                      className="focus-ring group rounded-full p-1.5 text-velvet-500 hover:text-gold-400 hover:bg-velvet-800/60 transition-colors"
                      aria-label={t("bankAliasCopy")}
                    >
                      {aliasCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-profit" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:scale-110">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-velvet-500">{t("bankAliasEmpty")}</span>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingAlias(true)}
                  className="focus-ring group rounded-full p-1.5 text-velvet-500 hover:text-gold-400 hover:bg-velvet-800/60 transition-colors"
                  aria-label={t("bankAliasEdit")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:scale-110">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Net Worth — full width */}
      <StatCard
        label={t("totalProfit")}
        delay="0.15s"
        className={profitBg}
      >
        <span className={`text-3xl font-bold tabular-nums sm:text-4xl ${profitColor}`}>
          {formatProfitLoss(stats.totalProfit, locale, DEFAULT_CURRENCY)}
        </span>
      </StatCard>

      {/* Nights + Winrate — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t("totalNights")}
          delay="0.2s"
        >
          <span className="text-2xl font-bold tabular-nums text-velvet-50 sm:text-3xl">
            {stats.nightsPlayed}
          </span>
        </StatCard>

        <StatCard
          label={t("winRate")}
          delay="0.25s"
        >
          <span className={`text-2xl font-bold tabular-nums sm:text-3xl ${winRateColor}`}>
            {Math.round(stats.winRate * 100)}%
          </span>
        </StatCard>
      </div>

      {/* Achievement badges */}
      {achievementData && <AchievementBadges input={achievementData} />}

      {/* Share profile */}
      {achievementData && (
        <div className="flex justify-center">
          <ShareProfile
            displayName={displayName}
            avatarUrl={avatarUrl || googleImage}
            totalProfit={stats.totalProfit}
            nightsPlayed={stats.nightsPlayed}
            winRate={stats.winRate}
            achievementData={achievementData}
          />
        </div>
      )}

      {/* Personal records */}
      {personalRecords && (
        <PersonalRecordsCard
          groupId={personalRecords.groupId}
          biggestWin={personalRecords.biggestWin}
          worstNight={personalRecords.worstNight}
          biggestWinNightId={personalRecords.biggestWinNightId}
          worstNightId={personalRecords.worstNightId}
          biggestWinDate={personalRecords.biggestWinDate}
          worstNightDate={personalRecords.worstNightDate}
          longestWinStreak={personalRecords.longestWinStreak}
        />
      )}

      {/* Group comparison */}
      {groupComparison && (
        <GroupComparisonCard
          data={groupComparison}
          locale={locale === "es" ? "es-ES" : "en-US"}
          currency={DEFAULT_CURRENCY}
        />
      )}

      {/* Profit history chart */}
      <ProfitChart data={profitHistory} locale={locale} currency="ARS" />
    </div>
  );
}

function StatCard({
  label,
  children,
  icon,
  delay = "0s",
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  delay?: string;
  className?: string;
}) {
  return (
    <Card
      className={`stat-card-glow animate-fade-in ${className}`}
      style={{ animationDelay: delay }}
    >
      <CardContent className="flex flex-col items-center gap-2 py-5 px-3 text-center sm:gap-3 sm:py-6 sm:px-4">
        {icon && (
          <div className="text-gold-500/60">{icon}</div>
        )}
        <div className="animate-count-up" style={{ animationDelay: delay }}>
          {children}
        </div>
        <span className="text-xs font-medium text-velvet-400">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}
