"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { approveJoinRequest, rejectJoinRequest } from "@/lib/actions/groups";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface PendingRequest {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}

interface PendingRequestsProps {
  requests: PendingRequest[];
}

export function PendingRequests({ requests }: PendingRequestsProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAction(requestId: string, action: "approve" | "reject") {
    startTransition(async () => {
      if (!session?.user) return;
      setError(null);

      const { profile } = await getOrCreateProfile({
        authUserId: session.user.id,
        displayName: session.user.name || session.user.email.split("@")[0],
        avatarUrl: session.user.image ?? undefined,
      });

      const result =
        action === "approve"
          ? await approveJoinRequest(requestId, profile.id)
          : await rejectJoinRequest(requestId, profile.id);

      if (result.error) {
        setError(typeof result.error === "string" ? result.error : tCommon("error"));
        return;
      }
      router.refresh();
    });
  }

  if (requests.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold">
        {t("pendingRequests")} ({requests.length})
      </h2>
      {error && (
        <p className="rounded-lg border border-loss/30 bg-loss-muted/20 px-3 py-2 text-sm text-loss">
          {error}
        </p>
      )}
      <div className={`space-y-2 ${isPending ? "pointer-events-none opacity-70" : ""}`}>
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center gap-3 rounded-lg border border-velvet-700/50 bg-velvet-800/50 px-3 py-3"
          >
            <Avatar src={req.avatarUrl} name={req.displayName} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-velvet-100">
              {req.displayName}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(req.id, "approve")}
                disabled={isPending}
              >
                {t("approve")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAction(req.id, "reject")}
                disabled={isPending}
              >
                {t("reject")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
