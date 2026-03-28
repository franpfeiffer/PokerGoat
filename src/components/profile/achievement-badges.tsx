"use client";

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
  const unlocked = computeAchievements(input).filter((a) => a.unlocked);

  if (unlocked.length === 0) return null;

  return (
    <Card>
      <CardContent className="py-5 px-4 sm:py-6">
        <h3 className="text-xs font-medium uppercase tracking-widest text-velvet-400 mb-4">
          {t("title")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {unlocked.map((a) => (
            <BadgePill key={a.id} id={a.id} icon={a.icon} tier={a.tier} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BadgePill({
  id,
  icon,
  tier,
}: {
  id: AchievementId;
  icon: string;
  tier: string;
}) {
  const t = useTranslations("achievements");

  return (
    <div
      title={t(`${id}.description`)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TIER_STYLES[tier]}`}
    >
      <span>{icon}</span>
      <span>{t(`${id}.name`)}</span>
    </div>
  );
}
