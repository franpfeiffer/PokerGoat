import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getGroupById, getGroupMembers } from "@/lib/db/queries/groups";
import { getHeadToHead } from "@/lib/db/queries/leaderboard";
import { HeadToHeadComparison } from "@/components/stats/head-to-head-comparison";

export default async function HeadToHeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; groupId: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { locale, groupId } = await params;
  const { a, b } = await searchParams;
  const t = await getTranslations("headToHead");
  const tCommon = await getTranslations("common");

  const [group, members] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
  ]);

  const players = members.map((m) => ({
    id: m.userId,
    name: m.displayName,
    avatarUrl: m.avatarUrl,
  }));

  let stats = null;
  if (a && b && a !== b) {
    stats = await getHeadToHead(groupId, a, b);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <Link href={`/groups/${groupId}`}>
          <Button variant="secondary" size="sm" className="min-h-11 sm:min-h-10">
            {tCommon("back")}
          </Button>
        </Link>
      </div>

      <HeadToHeadComparison
        players={players}
        stats={stats}
        initialA={a}
        initialB={b}
        groupId={groupId}
        locale={locale === "es" ? "es-ES" : "en-US"}
        currency={group?.currency ?? "ARS"}
      />
    </div>
  );
}
