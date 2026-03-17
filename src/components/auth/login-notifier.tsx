"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth/client";

export function LoginNotifier() {
  const notified = useRef(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user || notified.current) return;

    const key = `login-notified-${session.user.id}`;
    if (sessionStorage.getItem(key)) return;

    notified.current = true;
    sessionStorage.setItem(key, "1");

    fetch("/api/notify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: session.user.name ?? "Usuario",
        email: session.user.email,
      }),
    }).catch(() => {});
  }, [session]);

  return null;
}
