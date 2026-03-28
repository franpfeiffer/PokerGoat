import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { getTranslations } from "next-intl/server";
import type { ActivityItem } from "@/lib/db/queries/activity";
import { formatCurrency } from "@/lib/utils/currency";

interface ActivityFeedProps {
  items: ActivityItem[];
  locale: string;
  currency?: string;
}

function timeAgo(date: Date, locale: string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const isEs = locale === "es";

  if (diffMins < 1) return isEs ? "ahora" : "just now";
  if (diffMins < 60) return isEs ? `hace ${diffMins}m` : `${diffMins}m ago`;
  if (diffHours < 24) return isEs ? `hace ${diffHours}h` : `${diffHours}h ago`;
  if (diffDays < 7) return isEs ? `hace ${diffDays}d` : `${diffDays}d ago`;
  return date.toLocaleDateString(isEs ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

export async function ActivityFeed({
  items,
  locale,
  currency = "ARS",
}: ActivityFeedProps) {
  const t = await getTranslations("activity");

  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <ActivityRow
          key={item.id}
          item={item}
          locale={locale}
          currency={currency}
          t={t}
        />
      ))}
    </div>
  );
}

function ActivityRow({
  item,
  locale,
  currency,
  t,
}: {
  item: ActivityItem;
  locale: string;
  currency: string;
  t: Awaited<ReturnType<typeof getTranslations<"activity">>>;
}) {
  const meta = item.metadata as Record<string, unknown> | null;

  let icon = "📋";
  let text: React.ReactNode = null;

  if (item.type === "night_completed") {
    icon = "🏆";
    const pl = meta?.profitLoss as number | undefined;
    const nightName = meta?.nightName as string | undefined;
    const plStr = pl !== undefined
      ? formatCurrency(pl, locale === "es" ? "es-ES" : "en-US", currency)
      : "";
    text = (
      <>
        <span className="font-medium text-velvet-100">{item.actorName}</span>
        {" "}
        <span className="text-velvet-400">{t("wonNight")}</span>
        {nightName && (
          <>
            {" "}
            <span className="text-velvet-400">{t("in")}</span>
            {" "}
            <span className="font-medium text-velvet-200">{nightName}</span>
          </>
        )}
        {pl !== undefined && pl > 0 && (
          <>
            {" "}
            <span className="font-semibold text-profit">+{plStr}</span>
          </>
        )}
      </>
    );
  } else if (item.type === "night_created") {
    icon = "🃏";
    const nightName = meta?.nightName as string | undefined;
    text = (
      <>
        <span className="font-medium text-velvet-100">{item.actorName}</span>
        {" "}
        <span className="text-velvet-400">{t("createdNight")}</span>
        {nightName && (
          <>
            {" "}
            <span className="font-medium text-velvet-200">{nightName}</span>
          </>
        )}
      </>
    );
  } else if (item.type === "member_joined") {
    icon = "👤";
    text = (
      <>
        <span className="font-medium text-velvet-100">{item.actorName}</span>
        {" "}
        <span className="text-velvet-400">{t("joinedGroup")}</span>
      </>
    );
  } else if (item.type === "achievement_unlocked") {
    icon = "🏅";
    const achievementName = meta?.achievementName as string | undefined;
    const achievementIcon = meta?.achievementIcon as string | undefined;
    text = (
      <>
        <span className="font-medium text-velvet-100">{item.actorName}</span>
        {" "}
        <span className="text-velvet-400">{t("unlockedAchievement")}</span>
        {achievementName && (
          <>
            {" "}
            <span className="font-semibold text-gold-400">
              {achievementIcon} {achievementName}
            </span>
          </>
        )}
      </>
    );
  } else if (item.type === "rank_up") {
    icon = "⬆️";
    const rankIcon = meta?.rankIcon as string | undefined;
    const rankName = meta?.rankName as string | undefined;
    text = (
      <>
        <span className="font-medium text-velvet-100">{item.actorName}</span>
        {" "}
        <span className="text-velvet-400">{t("reachedRank")}</span>
        {rankName && (
          <>
            {" "}
            <span className="font-semibold text-purple-400">
              {rankIcon} {rankName}
            </span>
          </>
        )}
      </>
    );
  } else if (item.type === "personal_record") {
    icon = "📈";
    const recordType = meta?.recordType as string | undefined;
    const value = meta?.value as string | undefined;
    text = (
      <>
        <span className="font-medium text-velvet-100">{item.actorName}</span>
        {" "}
        <span className="text-velvet-400">{t("personalRecord")}</span>
        {recordType && value && (
          <>
            {" "}
            <span className="font-semibold text-profit">{value}</span>
          </>
        )}
      </>
    );
  }

  const rowContent = (
    <div className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-velvet-800/30 transition-colors">
      <div className="relative mt-0.5 shrink-0">
        <Avatar
          src={item.actorAvatar}
          name={item.actorName ?? "?"}
          size="xs"
        />
        <span
          className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">{text}</p>
        <p className="mt-0.5 text-[11px] text-velvet-500">
          {timeAgo(new Date(item.createdAt), locale)}
        </p>
      </div>
    </div>
  );

  if (item.targetId && item.type !== "member_joined") {
    // Link to night if it's a night event (targetId = nightId, but we need groupId)
    // We'll just render without link since we don't have groupId here
    return rowContent;
  }

  return rowContent;
}
