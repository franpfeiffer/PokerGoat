import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Grupos",
};

export default function GroupsPage() {
  const t = useTranslations("groups");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>
      <p className="text-velvet-400">Tus grupos aparecer\u00e1n aqu\u00ed.</p>
    </div>
  );
}
