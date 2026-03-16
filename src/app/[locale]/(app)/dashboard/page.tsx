import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

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
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          title={t("noGroups")}
          description={t("noGroupsAction")}
          action={
            <Link href="/groups/new">
              <Button>{t("createGroup")}</Button>
            </Link>
          }
        />
      </section>
    </div>
  );
}
