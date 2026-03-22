"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startSubscription, cancelMySubscription } from "@/lib/actions/subscriptions";

type Sub = {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled";
  amount: string;
  currency: string;
  currentPeriodEnd: Date | null;
} | null;

export function SubscriptionCard({ subscription }: { subscription: Sub }) {
  const t = useTranslations("subscription");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isActive = subscription?.status === "authorized";
  const isPaused = subscription?.status === "paused";
  const isPendingStatus = subscription?.status === "pending";

  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      const backUrl = window.location.href;
      const result = await startSubscription(backUrl);
      if (result.error) {
        setError(result.error);
      } else if (result.initPoint) {
        window.location.href = result.initPoint;
      }
    });
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelMySubscription();
      if (result.error) {
        setError(result.error);
      }
    });
  }

  const statusBadge = () => {
    if (isActive) return <Badge variant="profit">{t("status.active")}</Badge>;
    if (isPaused) return <Badge variant="gold">{t("status.paused")}</Badge>;
    if (isPendingStatus) return <Badge variant="muted">{t("status.pending")}</Badge>;
    return <Badge variant="muted">{t("status.inactive")}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {t("title")}
          </h2>
          {statusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-gold-400">
              $2.999
            </span>
            <span className="text-sm text-velvet-400">/ {t("perMonth")}</span>
          </div>

          <ul className="space-y-2 text-sm text-velvet-300">
            <li className="flex items-center gap-2">
              <CheckIcon />
              {t("features.unlimited")}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon />
              {t("features.stats")}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon />
              {t("features.priority")}
            </li>
          </ul>
        </div>

        {subscription?.currentPeriodEnd && isActive && (
          <p className="text-xs text-velvet-400">
            {t("renewsOn", {
              date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
            })}
          </p>
        )}

        {error && (
          <p className="text-sm text-loss">{error}</p>
        )}

        <div className="flex gap-3">
          {isActive ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              {isPending ? t("cancelling") : t("cancel")}
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={isPending || isPendingStatus}
            >
              {isPending
                ? t("processing")
                : isPendingStatus
                  ? t("status.pending")
                  : t("subscribe")}
            </Button>
          )}
        </div>

        {(isPaused || isPendingStatus) && (
          <p className="text-xs text-velvet-400">{t("pendingHint")}</p>
        )}
      </CardContent>
    </Card>
  );
}

function CheckIcon() {
  return (
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
      className="shrink-0 text-gold-500"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
