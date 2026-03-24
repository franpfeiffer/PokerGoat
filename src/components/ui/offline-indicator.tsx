"use client";

import { useOffline } from "@/hooks/use-offline";
import { useTranslations } from "next-intl";

export function OfflineIndicator() {
  const { isOffline, pendingCount, isSyncing } = useOffline();
  const t = useTranslations("offline");

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-20 left-3 right-3 z-50 mx-auto max-w-sm rounded-xl border px-4 py-2.5 text-center text-xs font-semibold shadow-lg backdrop-blur-sm lg:bottom-4 lg:left-auto lg:right-4 ${
        isOffline
          ? "border-loss/20 bg-loss/10 text-loss"
          : "border-gold-500/20 bg-gold-500/10 text-gold-400"
      }`}
    >
      {isOffline ? (
        <span>{t("offline")}</span>
      ) : isSyncing ? (
        <span>{t("syncing")}</span>
      ) : (
        <span>{t("pending", { count: pendingCount })}</span>
      )}
    </div>
  );
}
