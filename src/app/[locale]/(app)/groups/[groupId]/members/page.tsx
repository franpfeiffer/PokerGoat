import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Miembros",
};

export default function GroupMembersPage() {
  const t = useTranslations("groups");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold mb-6">{t("members")}</h1>
      <Card>
        <CardContent>
          <p className="text-velvet-400">Los miembros aparecer\u00e1n aqu\u00ed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
