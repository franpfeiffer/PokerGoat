"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { updateDisplayName, updateAvatar } from "@/lib/actions/profile";
import { formatCurrency } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";

interface ProfileContentProps {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  googleImage?: string | null;
  stats: {
    nightsPlayed: number;
    totalProfit: number;
    winRate: number;
  };
  locale: string;
  onUpdate?: () => void;
}

export function ProfileContent({
  userId,
  displayName,
  email,
  avatarUrl,
  googleImage,
  stats,
  locale,
  onUpdate,
}: ProfileContentProps) {
  const t = useTranslations("profile");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
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

  function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateDisplayName(userId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditingName(false);
        onUpdate?.();
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
        onUpdate?.();
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
            onUpdate?.();
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
    <div className="space-y-6">
      {/* Hero Card: Avatar + Identity */}
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center py-8 px-4 sm:py-10 sm:px-6">
          {/* Avatar with gold ring — clickable to change photo */}
          <div className="avatar-gold-ring animate-fade-in">
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
                className="ring-2 ring-velvet-900"
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

          {/* Reset avatar to Google photo */}
          {googleImage && avatarUrl && avatarUrl !== googleImage && (
            <button
              type="button"
              onClick={handleResetAvatar}
              disabled={isPending}
              className="focus-ring mt-3 rounded-full px-3 py-1 text-xs text-velvet-400 hover:text-gold-400 hover:bg-velvet-800/60 transition-colors disabled:opacity-50"
            >
              {t("resetAvatar")}
            </button>
          )}

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
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label={t("totalNights")}
          delay="0.15s"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 2v4" /><path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          }
        >
          <span className="text-2xl font-bold tabular-nums text-velvet-50 sm:text-3xl">
            {stats.nightsPlayed}
          </span>
        </StatCard>

        <StatCard
          label={t("totalProfit")}
          delay="0.2s"
          className={profitBg}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        >
          <span className={`text-2xl font-bold tabular-nums sm:text-3xl ${profitColor}`}>
            {formatCurrency(stats.totalProfit, locale, DEFAULT_CURRENCY)}
          </span>
        </StatCard>

        <StatCard
          label={t("winRate")}
          delay="0.25s"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          }
        >
          <span className={`text-2xl font-bold tabular-nums sm:text-3xl ${winRateColor}`}>
            {Math.round(stats.winRate * 100)}%
          </span>
        </StatCard>
      </div>
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
        <span className="text-xs font-medium uppercase tracking-widest text-velvet-400">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}
