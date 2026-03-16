"use client";

import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Member {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "leader" | "temporary_leader" | "member";
}

interface GroupMembersListProps {
  members: Member[];
  currentUserRole?: string;
  onRemove?: (userId: string) => void;
  onAssignTempLeader?: (userId: string) => void;
  onRevokeTempLeader?: (userId: string) => void;
}

export function GroupMembersList({
  members,
  currentUserRole,
  onRemove,
  onAssignTempLeader,
  onRevokeTempLeader,
}: GroupMembersListProps) {
  const t = useTranslations("groups");
  const isLeader = currentUserRole === "leader";
  const roleLabels: Record<Member["role"], string> = {
    leader: t("role.leader"),
    temporary_leader: t("role.temporaryLeader"),
    member: t("role.member"),
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-lg font-semibold">
        {t("members")} ({members.length})
      </h3>
      <ul className="divide-y divide-velvet-700/50">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 py-3"
          >
            <Avatar
              src={member.avatarUrl}
              name={member.displayName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-velvet-100 truncate">
                {member.displayName}
              </p>
            </div>
            <Badge
              variant={
                member.role === "leader"
                  ? "gold"
                  : member.role === "temporary_leader"
                    ? "gold"
                    : "muted"
              }
            >
              {roleLabels[member.role]}
            </Badge>
            {isLeader && member.role === "member" && (
              <div className="flex gap-1">
                {onAssignTempLeader && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssignTempLeader(member.userId)}
                    aria-label={t("assignTempLeaderAria", {
                      name: member.displayName,
                    })}
                  >
                    {t("promote")}
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onRemove(member.userId)}
                    aria-label={t("removeMemberAria", {
                      name: member.displayName,
                    })}
                  >
                    {t("removeMember")}
                  </Button>
                )}
              </div>
            )}
            {isLeader && member.role === "temporary_leader" && onRevokeTempLeader && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRevokeTempLeader(member.userId)}
              >
                {t("demote")}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
