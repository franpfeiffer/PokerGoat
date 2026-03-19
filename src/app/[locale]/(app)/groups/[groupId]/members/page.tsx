import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { GroupMembersPanel } from "@/components/groups/group-members-panel";
import { JoinRequestsModal } from "@/components/groups/join-requests-modal";
import { getGroupById, getGroupMembers, getPendingJoinRequests } from "@/lib/db/queries/groups";
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
  const [group, members, currentUser, pendingRequests] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
    session?.user ? getUserByAuthId(session.user.id) : null,
    getPendingJoinRequests(groupId),
  ]);

  if (!group) {
    notFound();
  }

  const currentUserRole = currentUser
    ? members.find((m) => m.userId === currentUser.id)?.role
    : undefined;

  const isLeader = currentUserRole === "leader" || currentUserRole === "temporary_leader";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t("members")}</h1>
        {isLeader && <JoinRequestsModal requests={pendingRequests} />}
      </div>
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
