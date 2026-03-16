import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GroupForm } from "@/components/groups/group-form";
import { createGroup } from "@/lib/actions/groups";

export const metadata: Metadata = {
  title: "Crear grupo",
};

export default function NewGroupPage() {
  const t = useTranslations("dashboard");

  async function handleCreateGroup(userId: string, formData: FormData) {
    "use server";
    return createGroup(userId, formData);
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <h1 className="font-display text-xl font-bold">
            {t("createGroup")}
          </h1>
        </CardHeader>
        <CardContent>
          <GroupForm action={handleCreateGroup} />
        </CardContent>
      </Card>
    </div>
  );
}
