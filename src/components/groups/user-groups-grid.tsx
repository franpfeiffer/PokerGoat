"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { getMyGroups } from "@/lib/actions/groups";
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

export function UserGroupsGrid() {
  const t = useTranslations("dashboard");
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [groups, setGroups] = useState<UserGroup[] | null>(null);

  useEffect(() => {
    if (sessionPending) return;
    const authUserId = session?.user?.id;
    if (typeof authUserId !== "string") {
      return;
    }
    const userId = authUserId;

    async function load() {
      const data = await getMyGroups(userId);
      setGroups(data as UserGroup[]);
    }

    load();
  }, [sessionPending, session]);

  const loading = sessionPending || groups === null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-velvet-700 border-t-gold-500" />
      </div>
    );
  }

  if (!session?.user || !groups?.length) {
    return (
      <EmptyState
        title={t("noGroups")}
        description={t("noGroupsAction")}
        action={
          <Link href="/groups/new">
            <Button>{t("createGroup")}</Button>
          </Link>
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
