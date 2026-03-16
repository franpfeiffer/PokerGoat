"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { startNight, completeNight } from "@/lib/actions/nights";

interface NightStatusActionProps {
  nightId: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export function NightStatusAction({ nightId, status }: NightStatusActionProps) {
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
          : await completeNight(nightId, profile.id);

      if (result.error) {
        setError(typeof result.error === "string" ? result.error : tCommon("error"));
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleClick} disabled={isPending} size="sm">
        {status === "scheduled"
          ? isPending
            ? `${t("start")}…`
            : t("start")
          : isPending
            ? `${t("finish")}…`
            : t("finish")}
      </Button>
      {error && <p className="text-xs text-loss">{error}</p>}
    </div>
  );
}
