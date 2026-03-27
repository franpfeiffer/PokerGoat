"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer.buffer;
}

export function PushToggle() {
  const { data: session } = authClient.useSession();
  const t = useTranslations("settings");
  // null = loading, true = enabled, false = disabled, string = error message
  const [state, setState] = useState<null | boolean | string>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }
    // Check for existing subscription without waiting for SW
    navigator.serviceWorker.getRegistrations().then(async (regs) => {
      for (const reg of regs) {
        try {
          const sub = await reg.pushManager.getSubscription();
          if (sub) { setState(true); return; }
        } catch { /* continue */ }
      }
      setState(false);
    }).catch(() => setState(false));
  }, [session]);

  if (!session?.user) return null;
  if (state === "unsupported") return null;
  if (state === "blocked") {
    return <p className="text-sm text-velvet-400">{t("notificationsDenied")}</p>;
  }
  // Still loading session
  if (state === null) {
    return <div className="h-6 w-11 animate-pulse rounded-full bg-velvet-700" />;
  }
  // Error string
  if (typeof state === "string") {
    return <p className="text-xs text-red-400 max-w-[160px] text-right">{state}</p>;
  }

  const isEnabled = state === true;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (isEnabled) {
        // Disable
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await fetch("/api/push", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
            await sub.unsubscribe();
          }
        }
        setState(false);
      } else {
        // Enable — request permission first
        const perm = await Notification.requestPermission();
        if (perm === "denied") { setState("blocked"); return; }
        if (perm !== "granted") { setState(false); return; }

        // Register SW
        await navigator.serviceWorker.register("/sw.js");

        // Wait for an active SW — up to 10s
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("SW not ready after 10s")), 10000)
          ),
        ]);

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        const json = sub.toJSON();
        await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
        });
        setState(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-velvet-300">
        {isEnabled ? t("notificationsEnabled") : t("notificationsDisabled")}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50 ${
          isEnabled ? "bg-gold-500" : "bg-velvet-700"
        }`}
        role="switch"
        aria-checked={isEnabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
