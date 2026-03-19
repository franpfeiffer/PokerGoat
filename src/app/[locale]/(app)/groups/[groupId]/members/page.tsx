import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { GroupMembersPanel } from "@/components/groups/group-members-panel";
import { getGroupById, getGroupMembers } from "@/lib/db/queries/groups";
import { auth } from "@/lib/auth/server";
import { getUserByAuthId } from "@/lib/db/queries/users";

export const metadata: Metadata = {
  title: "Miembros",
};

export default async function GroupMembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const [t, { data: session }] = await Promise.all([
    getTranslations("groups"),
    auth!.getSession(),
  ]);
  const [group, members, currentUser] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
    session?.user ? getUserByAuthId(session.user.id) : null,
  ]);

  if (!group) {
    notFound();
  }

  const currentUserRole = currentUser
    ? members.find((m) => m.userId === currentUser.id)?.role
    : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold mb-6">{t("members")}</h1>
      <Card>
        <CardContent className="pt-2">
          <GroupMembersPanel
            groupId={groupId}
            members={members}
            currentUserRole={currentUserRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}
