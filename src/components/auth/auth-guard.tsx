"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "@/i18n/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router, locale]);

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-velvet-700 border-t-gold-500" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}
