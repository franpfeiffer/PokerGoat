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

type PermissionState = "default" | "granted" | "denied" | "unsupported" | "loading";

export function PushToggle() {
  const { data: session } = authClient.useSession();
  const t = useTranslations("settings");
  const [state, setState] = useState<PermissionState>("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    setState(Notification.permission as PermissionState);
  }, []);

  if (!session?.user) return null;
  if (state === "unsupported") return null;

  async function enable() {
    setState("loading");
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      setState("granted");
    } catch {
      setState(Notification.permission as PermissionState);
    }
  }

  async function disable() {
    setState("loading");
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("default");
    } catch {
      setState(Notification.permission as PermissionState);
    }
  }

  if (state === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 animate-pulse rounded bg-velvet-700" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className="text-sm text-velvet-400">{t("notificationsDenied")}</p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-velvet-300">
        {state === "granted" ? t("notificationsEnabled") : t("notificationsDisabled")}
      </span>
      <button
        type="button"
        onClick={state === "granted" ? disable : enable}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
          state === "granted" ? "bg-gold-500" : "bg-velvet-700"
        }`}
        role="switch"
        aria-checked={state === "granted"}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            state === "granted" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
