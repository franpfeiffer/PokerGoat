"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestJoinGroup } from "@/lib/actions/groups";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";

interface JoinGroupFormProps {
  defaultInviteCode?: string;
}

export function JoinGroupForm({ defaultInviteCode = "" }: JoinGroupFormProps) {
  const t = useTranslations("groups.join");
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    groupName?: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (!session?.user) return;

      const profile = await getOrCreateProfile({
        authUserId: session.user.id,
        displayName: session.user.name || session.user.email.split("@")[0],
        avatarUrl: session.user.image ?? undefined,
      });
      const res = await requestJoinGroup(profile.id, formData);
      setResult(res);
    });
  }

  if (result?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-profit/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-profit"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm text-velvet-200">
          {t("pending")} &mdash; {result.groupName}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {result?.error && (
        <div
          role="alert"
          className="rounded-lg bg-loss-muted/20 border border-loss/30 px-4 py-2 text-sm text-loss"
        >
          {result.error}
        </div>
      )}

      <Input
        label={t("enterCode")}
        name="inviteCode"
        type="text"
        required
        autoComplete="off"
        placeholder="ABC12345"
        defaultValue={defaultInviteCode}
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? `${t("request")}\u2026` : t("request")}
      </Button>
    </form>
  );
}
