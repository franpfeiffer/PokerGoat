import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserGroupsGrid } from "@/components/groups/user-groups-grid";
import { auth } from "@/lib/auth/server";
import { getUserByAuthId } from "@/lib/db/queries/users";
import { getUserGroups } from "@/lib/db/queries/groups";

export const metadata: Metadata = {
  title: "Grupos",
};

export default async function GroupsPage() {
  const t = await getTranslations("groups");
  const { data: session } = await auth!.getSession();

  const currentUser = session?.user ? await getUserByAuthId(session.user.id) : null;
  const [groups, isAdmin] = await Promise.all([
    currentUser ? getUserGroups(currentUser.id) : [],
    Promise.resolve(session?.user?.email === process.env.ADMIN_EMAIL),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>
      <UserGroupsGrid groups={groups} isAdmin={isAdmin} />
    </div>
  );
}
