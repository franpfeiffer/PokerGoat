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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-velvet-50">
          {t("title")}
        </h1>
        <div className="flex gap-2">
          <Link href="/groups/join">
            <Button variant="secondary" size="sm">
              {t("joinGroup")}
            </Button>
          </Link>
          <Link href="/groups/new">
            <Button size="sm">{t("createGroup")}</Button>
          </Link>
        </div>
      </div>

      <section
        aria-labelledby="groups-heading"
        className="animate-fade-in rounded-xl border border-velvet-700 bg-surface bg-card-pattern"
      >
        <h2 id="groups-heading" className="sr-only">
          {t("yourGroups")}
        </h2>
        <UserGroupsGrid />
      </section>
    </div>
  );
}
