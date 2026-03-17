import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UserGroupsGrid } from "@/components/groups/user-groups-grid";

export const metadata: Metadata = {
  title: "Panel de control",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");

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
          <Link href="/groups/new" className="flex-1 sm:flex-none">
            <Button size="sm" className="min-h-11 w-full sm:min-h-10 sm:w-auto">{t("createGroup")}</Button>
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="groups-heading"
        className="animate-fade-in rounded-xl border border-velvet-700/60 bg-velvet-900"
      >
        <h2 id="groups-heading" className="sr-only">
          {t("yourGroups")}
        </h2>
        <UserGroupsGrid />
      </section>
    </div>
  );
}
