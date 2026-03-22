"use client";

import { useTransition } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import type { NightChipValues } from "@/lib/utils/chips";

interface NightFormProps {
  groupId: string;
  defaults?: {
    date?: string;
    name?: string;
    chipValues: {
      black: number;
      white: number;
      red: number;
      green: number;
      blue: number;
    };
    buyIn: number;
    maxRebuys?: number | null;
    notes?: string;
    chipQuantities?: NightChipValues;
  };
  submitLabel?: "create" | "save";
  action: (
    userId: string,
    formData: FormData
  ) => Promise<{ nightId?: string; success?: boolean; error?: unknown }>;
}

export function NightForm({
  defaults,
  action,
  submitLabel = "create",
}: NightFormProps) {
  const t = useTranslations("nights");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [chipQtyBlack, setChipQtyBlack] = useState(defaults?.chipQuantities?.black ?? 0);
  const [chipQtyWhite, setChipQtyWhite] = useState(defaults?.chipQuantities?.white ?? 0);
  const [chipQtyRed, setChipQtyRed] = useState(defaults?.chipQuantities?.red ?? 0);
  const [chipQtyGreen, setChipQtyGreen] = useState(defaults?.chipQuantities?.green ?? 0);
  const [chipQtyBlue, setChipQtyBlue] = useState(defaults?.chipQuantities?.blue ?? 0);

  const [chipValBlack, setChipValBlack] = useState(defaults?.chipValues.black ?? 500);
  const [chipValWhite, setChipValWhite] = useState(defaults?.chipValues.white ?? 100);
  const [chipValRed, setChipValRed] = useState(defaults?.chipValues.red ?? 50);
  const [chipValGreen, setChipValGreen] = useState(defaults?.chipValues.green ?? 25);
  const [chipValBlue, setChipValBlue] = useState(defaults?.chipValues.blue ?? 10);
  const [buyInVal, setBuyInVal] = useState(defaults?.buyIn ?? 5000);

  const hasAnyQty = chipQtyBlack > 0 || chipQtyWhite > 0 || chipQtyRed > 0 || chipQtyGreen > 0 || chipQtyBlue > 0;
  const calculatedBuyInValue =
    chipQtyBlack * chipValBlack +
    chipQtyWhite * chipValWhite +
    chipQtyRed * chipValRed +
    chipQtyGreen * chipValGreen +
    chipQtyBlue * chipValBlue;
  const buyInMismatch = hasAnyQty && calculatedBuyInValue !== buyInVal;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (!session?.user) return;
      setError(null);

      const { profile } = await getOrCreateProfile({
        authUserId: session.user.id,
        displayName: session.user.name || session.user.email.split("@")[0],
        avatarUrl: session.user.image ?? undefined,
      });
      const result = await action(profile.id, formData);
      if (result.nightId) {
        router.back();
      } else if (result.success) {
        router.back();
      } else if (result.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : tCommon("error")
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-loss/30 bg-loss-muted/20 px-4 py-2 text-sm text-loss"
        >
          {error}
        </div>
      )}

      <Input
        label={t("date")}
        name="date"
        type="date"
        required
        defaultValue={defaults?.date ?? today}
      />

      <Input
        label={t("nameOptional")}
        name="name"
        type="text"
        defaultValue={defaults?.name}
        autoComplete="off"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("chipBlack")}
          name="chipValueBlack"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={chipValBlack}
          onChange={(e) => setChipValBlack(Number(e.target.value) || 0)}
          autoComplete="off"
        />
        <Input
          label={t("chipWhite")}
          name="chipValueWhite"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={chipValWhite}
          onChange={(e) => setChipValWhite(Number(e.target.value) || 0)}
          autoComplete="off"
        />
        <Input
          label={t("chipRed")}
          name="chipValueRed"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={chipValRed}
          onChange={(e) => setChipValRed(Number(e.target.value) || 0)}
          autoComplete="off"
        />
        <Input
          label={t("chipGreen")}
          name="chipValueGreen"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={chipValGreen}
          onChange={(e) => setChipValGreen(Number(e.target.value) || 0)}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("chipBlue")}
          name="chipValueBlue"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={chipValBlue}
          onChange={(e) => setChipValBlue(Number(e.target.value) || 0)}
          autoComplete="off"
        />
        <Input
          label={t("buyIn")}
          name="buyInAmount"
          type="number"
          step="1"
          min="1"
          required
          value={buyInVal}
          onChange={(e) => setBuyInVal(Number(e.target.value) || 0)}
          autoComplete="off"
        />
      </div>

      <Input
        label={t("maxRebuys")}
        name="maxRebuys"
        type="number"
        min="0"
        placeholder={t("unlimited")}
        defaultValue={defaults?.maxRebuys ?? undefined}
        autoComplete="off"
      />

      <details
        className="rounded-lg border border-velvet-700/60 bg-velvet-900/40"
        open={hasAnyQty || undefined}
      >
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-velvet-200 select-none">
          {t("initialChipQuantities")}
        </summary>
        <div className="space-y-3 px-3 pb-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Input
              label={t("chipBlackQty")}
              name="chipQtyBlack"
              type="number"
              min="0"
              step="1"
              value={chipQtyBlack}
              onChange={(e) => setChipQtyBlack(Number(e.target.value) || 0)}
              autoComplete="off"
            />
            <Input
              label={t("chipWhiteQty")}
              name="chipQtyWhite"
              type="number"
              min="0"
              step="1"
              value={chipQtyWhite}
              onChange={(e) => setChipQtyWhite(Number(e.target.value) || 0)}
              autoComplete="off"
            />
            <Input
              label={t("chipRedQty")}
              name="chipQtyRed"
              type="number"
              min="0"
              step="1"
              value={chipQtyRed}
              onChange={(e) => setChipQtyRed(Number(e.target.value) || 0)}
              autoComplete="off"
            />
            <Input
              label={t("chipGreenQty")}
              name="chipQtyGreen"
              type="number"
              min="0"
              step="1"
              value={chipQtyGreen}
              onChange={(e) => setChipQtyGreen(Number(e.target.value) || 0)}
              autoComplete="off"
            />
            <Input
              label={t("chipBlueQty")}
              name="chipQtyBlue"
              type="number"
              min="0"
              step="1"
              value={chipQtyBlue}
              onChange={(e) => setChipQtyBlue(Number(e.target.value) || 0)}
              autoComplete="off"
            />
          </div>
          {hasAnyQty && (
            <div className="space-y-1">
              <p className="text-xs text-velvet-400">
                {t("buyInValueCheck")}:{" "}
                <span className="font-semibold text-velvet-200 tabular-nums">
                  ${calculatedBuyInValue.toLocaleString()}
                </span>
              </p>
              {buyInMismatch && (
                <p className="text-xs text-amber-400">
                  {t("buyInValueMismatch")}
                </p>
              )}
            </div>
          )}
        </div>
      </details>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-velvet-200">
          {t("notes")}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={defaults?.notes}
          className="focus-ring rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 placeholder:text-velvet-500 transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? `${tCommon(submitLabel)}\u2026`
            : tCommon(submitLabel)}
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
