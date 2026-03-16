import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InviteLink } from "@/components/groups/invite-link";

export const metadata: Metadata = {
  title: "Ajustes del grupo",
};

export default function GroupSettingsPage() {
  const t = useTranslations("groups");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("settings")}</h1>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">
            {t("inviteCode")}
          </h2>
        </CardHeader>
        <CardContent>
          <InviteLink inviteCode="DEMO1234" />
        </CardContent>
      </Card>
    </div>
  );
}
