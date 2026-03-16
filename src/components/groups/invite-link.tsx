"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface InviteLinkProps {
  inviteCode: string;
}

export function InviteLink({ inviteCode }: InviteLinkProps) {
  const t = useTranslations("groups");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = `${window.location.origin}/groups/join?code=${inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [inviteCode]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2">
        <code className="text-sm text-gold-400 tabular-nums">
          {inviteCode}
        </code>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        aria-label={t("copyInvite")}
      >
        {copied ? t("copied") : t("copyInvite")}
      </Button>
    </div>
  );
}
