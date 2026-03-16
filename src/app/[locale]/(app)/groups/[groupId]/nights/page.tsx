import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Noches de poker",
};

export default function NightsListPage() {
  const t = useTranslations("nights");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <Link href="nights/new">
          <Button size="sm">{t("create")}</Button>
        </Link>
      </div>

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
          <Link href="nights/new">
            <Button>{t("create")}</Button>
          </Link>
        }
      />
    </div>
  );
}
