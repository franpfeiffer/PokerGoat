"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface GroupFormProps {
  action: (formData: FormData) => Promise<{ groupId?: string; error?: unknown }>;
  defaults?: {
    name?: string;
    description?: string;
    defaultChipValue?: number;
    defaultBuyIn?: number;
    currency?: string;
  };
}

export function GroupForm({ action, defaults }: GroupFormProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
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

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("defaultChipValue")}
          name="defaultChipValue"
          type="number"
          step="1"
          min="1"
          defaultValue={defaults?.defaultChipValue ?? 1}
          autoComplete="off"
        />
        <Input
          label={t("defaultBuyIn")}
          name="defaultBuyIn"
          type="number"
          step="1"
          min="1"
          defaultValue={defaults?.defaultBuyIn ?? 10}
          autoComplete="off"
        />
      </div>

      <Select
        label={t("currency")}
        name="currency"
        defaultValue={defaults?.currency ?? "USD"}
        options={[
          { value: "EUR", label: "EUR (\u20ac)" },
          { value: "USD", label: "USD ($)" },
          { value: "GBP", label: "GBP (\u00a3)" },
        ]}
      />

      <div className="flex gap-3 pt-2">
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
