import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JoinGroupForm } from "@/components/groups/join-group-form";

export const metadata: Metadata = {
  title: "Unirse a grupo",
};

export default function JoinGroupPage() {
  const t = useTranslations("groups.join");

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <h1 className="font-display text-xl font-bold">{t("title")}</h1>
        </CardHeader>
        <CardContent>
          <JoinGroupForm />
        </CardContent>
      </Card>
    </div>
  );
}
