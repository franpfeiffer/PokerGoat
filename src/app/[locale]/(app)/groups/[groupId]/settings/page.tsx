import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InviteLink } from "@/components/groups/invite-link";
import { GroupForm } from "@/components/groups/group-form";
import { getGroupById } from "@/lib/db/queries/groups";
import { updateGroup } from "@/lib/actions/groups";

export const metadata: Metadata = {
  title: "Ajustes del grupo",
};

export default async function GroupSettingsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const t = await getTranslations("groups");
  const group = await getGroupById(groupId);

  if (!group) {
    notFound();
  }

  async function handleUpdateGroup(userId: string, formData: FormData) {
    "use server";
    const result = await updateGroup(groupId, userId, formData);
    if (result.success) return { groupId };
    return result;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("settings")}</h1>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">
            {t("settings")}
          </h2>
        </CardHeader>
        <CardContent>
          <GroupForm
            action={handleUpdateGroup}
            defaults={{
              name: group.name,
              description: group.description ?? undefined,
              defaultBuyIn: Number(group.defaultBuyIn),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">
            {t("inviteCode")}
          </h2>
        </CardHeader>
        <CardContent>
          <InviteLink inviteCode={group.inviteCode} />
        </CardContent>
      </Card>
    </div>
  );
}
