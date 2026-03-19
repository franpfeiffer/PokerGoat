"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { checkIsAdmin } from "@/lib/actions/admin";

export function CreateGroupButton() {
  const t = useTranslations("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkIsAdmin().then(setIsAdmin);
  }, []);

  if (!isAdmin) return null;

  return (
    <Link href="/groups/new" className="flex-1 sm:flex-none">
      <Button size="sm" className="min-h-11 w-full sm:min-h-10 sm:w-auto">
        {t("createGroup")}
      </Button>
    </Link>
  );
}
