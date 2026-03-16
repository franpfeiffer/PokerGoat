import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { UserGroupsGrid } from "@/components/groups/user-groups-grid";

export const metadata: Metadata = {
  title: "Grupos",
};

export default function GroupsPage() {
  const t = useTranslations("groups");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>
      <UserGroupsGrid />
    </div>
  );
}
