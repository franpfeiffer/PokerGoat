import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GroupCard } from "@/components/groups/group-card";

type UserGroup = {
  id: string;
  name: string;
  description: string | null;
  role: "leader" | "temporary_leader" | "member";
  currency: string;
};

interface UserGroupsGridProps {
  groups: UserGroup[];
  isAdmin: boolean;
}

export async function UserGroupsGrid({ groups, isAdmin }: UserGroupsGridProps) {
  const t = await getTranslations("dashboard");

  if (!groups.length) {
    return (
      <EmptyState
        title={t("noGroups")}
        description={t("noGroupsAction")}
        action={
          isAdmin ? (
            <Link href="/groups/new">
              <Button>{t("createGroup")}</Button>
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          id={group.id}
          name={group.name}
          description={group.description}
          role={group.role}
          currency={group.currency}
        />
      ))}
    </div>
  );
}
