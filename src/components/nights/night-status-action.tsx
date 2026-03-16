"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { startNight } from "@/lib/actions/nights";
import { calculateAndSaveResults } from "@/lib/actions/results";

interface NightStatusActionProps {
  groupId: string;
  nightId: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export function NightStatusAction({
  groupId,
  nightId,
  status,
}: NightStatusActionProps) {
  const t = useTranslations("nights");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "scheduled" && status !== "in_progress") {
    return null;
  }

  function handleClick() {
    startTransition(async () => {
      if (!session?.user) return;
      setError(null);

      const profile = await getOrCreateProfile({
        authUserId: session.user.id,
        displayName: session.user.name || session.user.email.split("@")[0],
        avatarUrl: session.user.image ?? undefined,
      });

      const result =
        status === "scheduled"
          ? await startNight(nightId, profile.id)
          : await calculateAndSaveResults(nightId, profile.id);

      if (result.error) {
        setError(typeof result.error === "string" ? result.error : tCommon("error"));
        return;
      }

      if (status === "in_progress") {
        router.push(`/groups/${groupId}/nights/${nightId}/results`);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="w-full space-y-2 sm:w-auto">
      <Button
        onClick={handleClick}
        disabled={isPending}
        size="sm"
        className="min-h-11 w-full justify-center sm:min-h-10 sm:w-auto"
      >
        {status === "scheduled"
          ? isPending
            ? `${t("start")}…`
            : t("start")
          : isPending
            ? `${t("finish")}…`
            : t("finish")}
      </Button>
      {error && <p className="text-xs text-loss sm:text-right">{error}</p>}
    </div>
  );
}
