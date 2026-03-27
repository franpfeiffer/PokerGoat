import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UserGroupsGrid } from "@/components/groups/user-groups-grid";
import { CreateGroupButton } from "@/components/groups/create-group-button";
import { StatsWidget } from "@/components/dashboard/stats-widget";
import { UpcomingNightsBanner } from "@/components/dashboard/upcoming-nights-banner";
import { auth } from "@/lib/auth/server";
import { getUserByAuthId, getDashboardStats } from "@/lib/db/queries/users";
import { getUserGroups } from "@/lib/db/queries/groups";
import { getUpcomingNightsForUser } from "@/lib/db/queries/nights";

export const metadata: Metadata = {
  title: "Panel de control",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, { data: session }] = await Promise.all([
    getTranslations("dashboard"),
    auth!.getSession(),
  ]);

  const authUser = session?.user;
  const currentUser = authUser ? await getUserByAuthId(authUser.id) : null;

  const [stats, groups, upcomingNights, isAdmin] = await Promise.all([
    currentUser ? getDashboardStats(currentUser.id) : null,
    currentUser ? getUserGroups(currentUser.id) : [],
    currentUser ? getUpcomingNightsForUser(currentUser.id) : [],
    Promise.resolve(authUser?.email === process.env.ADMIN_EMAIL),
  ]);

  return (
    <div className="mx-auto max-w-4xl py-2">
      <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-velvet-50 sm:text-3xl">
          {t("title")}
        </h1>
        <div className="flex gap-2">
          <Link href="/groups/join" className="flex-1 sm:flex-none">
            <Button variant="secondary" size="sm" className="min-h-11 w-full sm:min-h-10 sm:w-auto">
              {t("joinGroup")}
            </Button>
          </Link>
          <CreateGroupButton />
        </div>
      </div>

      <UpcomingNightsBanner nights={upcomingNights} locale={locale} />
      <StatsWidget stats={stats} />

      <section
        aria-labelledby="groups-heading"
        className="animate-fade-in rounded-xl border border-velvet-700/60 bg-velvet-900"
      >
        <h2 id="groups-heading" className="sr-only">
          {t("yourGroups")}
        </h2>
        <UserGroupsGrid groups={groups} isAdmin={isAdmin} />
      </section>
    </div>
  );
}
