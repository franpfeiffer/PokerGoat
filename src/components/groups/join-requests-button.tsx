"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { approveJoinRequest, rejectJoinRequest } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";

interface JoinRequest {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}

interface JoinRequestsButtonProps {
  requests: JoinRequest[];
}

export function JoinRequestsButton({ requests }: JoinRequestsButtonProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        {t("pendingRequests")}
        <Badge variant="gold" className="ml-1">
          {requests.length}
        </Badge>
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t("pendingRequests")}
      >
        <div className="space-y-4">
          {error && (
            <p className="rounded-lg border border-loss/30 bg-loss-muted/20 px-3 py-2 text-sm text-loss">
              {error}
            </p>
          )}
          {requests.length === 0 ? (
            <p className="text-center text-velvet-400 py-4">{t("noPendingRequests")}</p>
          ) : (
            <div className="space-y-2">
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
          )}
        </div>
      </Dialog>
    </>
  );
}
