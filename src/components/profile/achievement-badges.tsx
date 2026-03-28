"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { computeAchievements, type AchievementInput, type AchievementId } from "@/lib/achievements";

interface AchievementBadgesProps {
  input: AchievementInput;
}

const TIER_STYLES: Record<string, string> = {
  bronze: "border-amber-700/50 bg-amber-900/20 text-amber-400",
  silver: "border-slate-400/40 bg-slate-700/20 text-slate-300",
  gold: "border-yellow-500/50 bg-yellow-900/20 text-yellow-400",
  legendary: "border-purple-500/50 bg-purple-900/20 text-purple-300",
};

export function AchievementBadges({ input }: AchievementBadgesProps) {
  const t = useTranslations("achievements");
  const [active, setActive] = useState<AchievementId | null>(null);
  const unlocked = computeAchievements(input).filter((a) => a.unlocked);

  if (unlocked.length === 0) return null;

  const activeAchievement = active ? unlocked.find((a) => a.id === active) : null;

  function handleTap(id: AchievementId) {
    setActive((prev) => (prev === id ? null : id));
  }

  return (
    <Card>
      <CardContent className="py-5 px-4 sm:py-6">
        <h3 className="text-xs font-medium text-velvet-400 mb-4">
          {t("title")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {unlocked.map((a) => (
            <BadgePill
              key={a.id}
              id={a.id}
              icon={a.icon}
              tier={a.tier}
              isActive={active === a.id}
              onTap={handleTap}
            />
          ))}
        </div>

        {activeAchievement && (
          <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${TIER_STYLES[activeAchievement.tier]}`}>
            <span className="font-semibold">{t(`${activeAchievement.id}.name`)}</span>
            <span className="mx-1.5 opacity-50">—</span>
            <span className="opacity-80">{t(`${activeAchievement.id}.description`)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BadgePill({
  id,
  icon,
  tier,
  isActive,
  onTap,
}: {
  id: AchievementId;
  icon: string;
  tier: string;
  isActive: boolean;
  onTap: (id: AchievementId) => void;
}) {
  const t = useTranslations("achievements");

  return (
    <button
      type="button"
      title={t(`${id}.description`)}
      onClick={() => onTap(id)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity active:scale-95 ${TIER_STYLES[tier]} ${isActive ? "ring-1 ring-current ring-offset-1 ring-offset-transparent" : ""}`}
    >
      <span>{icon}</span>
      <span>{t(`${id}.name`)}</span>
    </button>
  );
}
