import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NightForm } from "@/components/nights/night-form";
import { getNightById } from "@/lib/db/queries/nights";
import { parseNightMetadata } from "@/lib/utils/chips";
import { updateNight } from "@/lib/actions/nights";

export const metadata: Metadata = {
  title: "Editar noche",
};

export default async function EditNightPage({
  params,
}: {
  params: Promise<{ groupId: string; nightId: string }>;
}) {
  const { groupId, nightId } = await params;
  const t = await getTranslations("nights");
  const night = await getNightById(nightId);
  if (!night || night.groupId !== groupId) {
    notFound();
  }

  const metadata = parseNightMetadata(night.notes, Number(night.chipValue));

  async function handleUpdateNight(userId: string, formData: FormData) {
    "use server";
    return updateNight(nightId, userId, formData);
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <h1 className="font-display text-xl font-bold">{t("editNight")}</h1>
        </CardHeader>
        <CardContent>
          <NightForm
            groupId={groupId}
            submitLabel="save"
            action={handleUpdateNight}
            defaults={{
              date: night.date,
              name: night.name ?? undefined,
              chipValues: metadata.chipValues,
              buyIn: Number(night.buyInAmount),
              maxRebuys: night.maxRebuys,
              notes: metadata.notes,
              chipQuantities: metadata.chipQuantities,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
