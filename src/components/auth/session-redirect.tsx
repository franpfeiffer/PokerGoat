"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "@/i18n/navigation";

export function SessionRedirect({ to }: { to: string }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(to);
    }
  }, [isPending, session, router, to]);

  return null;
}
