"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import {
  assignTemporaryLeader,
  removeMember,
  revokeTemporaryLeader,
} from "@/lib/actions/groups";
import { GroupMembersList } from "@/components/groups/group-members-list";

interface Member {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "leader" | "temporary_leader" | "member";
}

interface GroupMembersPanelProps {
  groupId: string;
  members: Member[];
}

export function GroupMembersPanel({ groupId, members }: GroupMembersPanelProps) {
  const tCommon = useTranslations("common");
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentUserRole, setCurrentUserRole] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    let isMounted = true;
    async function loadRole() {
      if (!session?.user) return;
      const profile = await getOrCreateProfile({
        authUserId: session.user.id,
        displayName: session.user.name || session.user.email.split("@")[0],
        avatarUrl: session.user.image ?? undefined,
      });
      if (!isMounted) return;
      const membership = members.find((member) => member.userId === profile.id);
      setCurrentUserRole(membership?.role);
    }
    loadRole();
    return () => {
      isMounted = false;
    };
  }, [members, session]);

  function withProfileAction(
    callback: (profileId: string) => Promise<{ error?: unknown; success?: boolean }>
  ) {
    startTransition(async () => {
      if (!session?.user) return;
      setError(null);

      const profile = await getOrCreateProfile({
        authUserId: session.user.id,
        displayName: session.user.name || session.user.email.split("@")[0],
        avatarUrl: session.user.image ?? undefined,
      });

      const result = await callback(profile.id);
      if (result.error) {
        setError(typeof result.error === "string" ? result.error : tCommon("error"));
        return;
      }
      router.refresh();
    });
  }

  function handleRemove(memberUserId: string) {
    withProfileAction((profileId) => removeMember(groupId, memberUserId, profileId));
  }

  function handleAssignTemporaryLeader(memberUserId: string) {
    withProfileAction((profileId) =>
      assignTemporaryLeader(groupId, memberUserId, profileId)
    );
  }

  function handleRevokeTemporaryLeader(memberUserId: string) {
    withProfileAction((profileId) =>
      revokeTemporaryLeader(groupId, memberUserId, profileId)
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-loss/30 bg-loss-muted/20 px-3 py-2 text-sm text-loss">
          {error}
        </p>
      )}
      <div className={isPending ? "pointer-events-none opacity-70" : undefined}>
        <GroupMembersList
          members={members}
          currentUserRole={currentUserRole}
          onRemove={handleRemove}
          onAssignTempLeader={handleAssignTemporaryLeader}
          onRevokeTempLeader={handleRevokeTemporaryLeader}
        />
      </div>
    </div>
  );
}
