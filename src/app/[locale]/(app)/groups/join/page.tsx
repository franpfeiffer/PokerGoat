import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JoinGroupForm } from "@/components/groups/join-group-form";

export const metadata: Metadata = {
  title: "Unirse a grupo",
};

export default async function JoinGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const t = await getTranslations("groups.join");
  const { code } = await searchParams;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <h1 className="font-display text-xl font-bold">{t("title")}</h1>
        </CardHeader>
        <CardContent>
          <JoinGroupForm defaultInviteCode={code ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
