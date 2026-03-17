"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";

interface GroupFormProps {
  action: (
    userId: string,
    formData: FormData
  ) => Promise<{ groupId?: string; error?: unknown }>;
  defaults?: {
    name?: string;
    description?: string;
    defaultBuyIn?: number;
  };
}

export function GroupForm({ action, defaults }: GroupFormProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

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
      const result = await action(profile.id, formData);
      if (result.groupId) {
        router.push(`/groups/${result.groupId}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t("name")}
        name="name"
        type="text"
        required
        defaultValue={defaults?.name}
        autoComplete="off"
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="text-sm font-medium text-velvet-200"
        >
          {t("description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description}
          className="focus-ring rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 placeholder:text-velvet-500 transition-colors resize-none"
        />
      </div>

      <Input
        label={t("defaultBuyIn")}
        name="defaultBuyIn"
        type="number"
        step="1"
        min="1"
        defaultValue={defaults?.defaultBuyIn ?? 5000}
        autoComplete="off"
      />

      <div className="flex justify-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? `${tCommon("save")}\u2026` : tCommon("save")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
