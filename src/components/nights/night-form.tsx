"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NightFormProps {
  groupId: string;
  defaults?: {
    chipValue: number;
    buyIn: number;
  };
  action: (formData: FormData) => Promise<{ nightId?: string; error?: unknown }>;
}

export function NightForm({ defaults, action }: NightFormProps) {
  const t = useTranslations("nights");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.nightId) {
        router.back();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t("date")}
        name="date"
        type="date"
        required
        defaultValue={today}
      />

      <Input
        label="Nombre (opcional)"
        name="name"
        type="text"
        autoComplete="off"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("chipValue")}
          name="chipValue"
          type="number"
          step="1"
          min="1"
          required
          defaultValue={defaults?.chipValue ?? 1}
          autoComplete="off"
        />
        <Input
          label={t("buyIn")}
          name="buyInAmount"
          type="number"
          step="1"
          min="1"
          required
          defaultValue={defaults?.buyIn ?? 10}
          autoComplete="off"
        />
      </div>

      <Input
        label={t("maxRebuys")}
        name="maxRebuys"
        type="number"
        min="0"
        placeholder={t("unlimited")}
        autoComplete="off"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-velvet-200">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="focus-ring rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 placeholder:text-velvet-500 transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? `${tCommon("create")}\u2026` : tCommon("create")}
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
