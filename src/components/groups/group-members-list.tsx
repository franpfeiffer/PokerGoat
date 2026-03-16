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
}

const roleLabels: Record<string, string> = {
  leader: "L\u00edder",
  temporary_leader: "L\u00edder temporal",
  member: "Miembro",
};

export function GroupMembersList({
  members,
  currentUserRole,
  onRemove,
  onAssignTempLeader,
}: GroupMembersListProps) {
  const t = useTranslations("groups");
  const isLeader = currentUserRole === "leader";

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
                    aria-label={`Asignar l\u00edder temporal a ${member.displayName}`}
                  >
                    Promover
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onRemove(member.userId)}
                    aria-label={`Eliminar a ${member.displayName}`}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
