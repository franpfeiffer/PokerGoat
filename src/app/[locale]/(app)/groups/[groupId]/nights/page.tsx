import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NightCard } from "@/components/nights/night-card";
import { getGroupNights } from "@/lib/db/queries/nights";

export const metadata: Metadata = {
  title: "Noches de poker",
};

export default async function NightsListPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>;
}) {
  const { locale, groupId } = await params;
  const t = await getTranslations("nights");
  const nights = await getGroupNights(groupId);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <Link href={`/groups/${groupId}/nights/new`}>
          <Button size="sm">{t("create")}</Button>
        </Link>
      </div>

      {nights.length === 0 ? (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          title={t("noNights")}
          description={t("noNightsAction")}
          action={
            <Link href={`/groups/${groupId}/nights/new`}>
              <Button>{t("create")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {nights.map((night) => (
            <NightCard
              key={night.id}
              id={night.id}
              groupId={groupId}
              name={night.name}
              date={night.date}
              status={night.status}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
