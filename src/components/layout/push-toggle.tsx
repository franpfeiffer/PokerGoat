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

type UIState = "loading" | "unsupported" | "denied" | "enabled" | "disabled";

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration> {
  // If already active, return immediately
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing?.active) return existing;

  // Register and wait for activation (up to 10s)
  const reg = await navigator.serviceWorker.register("/sw.js");
  if (reg.active) return reg;

  return new Promise((resolve, reject) => {
    const sw = reg.installing ?? reg.waiting;
    if (!sw) {
      reject(new Error("No SW installing"));
      return;
    }
    const timer = setTimeout(() => reject(new Error("SW activation timeout")), 10_000);
    sw.addEventListener("statechange", () => {
      if (sw.state === "activated") {
        clearTimeout(timer);
        resolve(reg);
      }
    });
  });
}

export function PushToggle() {
  const { data: session } = authClient.useSession();
  const t = useTranslations("settings");
  const [uiState, setUiState] = useState<UIState>("loading");

  useEffect(() => {
    if (!session?.user) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setUiState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setUiState("denied");
      return;
    }

    // Check if there's an existing active push subscription
    navigator.serviceWorker.getRegistration("/").then(async (reg) => {
      if (!reg) {
        setUiState("disabled");
        return;
      }
      const sub = await reg.pushManager.getSubscription();
      setUiState(sub ? "enabled" : "disabled");
    }).catch(() => setUiState("disabled"));
  }, [session]);

  if (!session?.user) return null;
  if (uiState === "unsupported") return null;

  async function enable() {
    setUiState("loading");
    try {
      const reg = await getOrRegisterSW();
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
      setUiState("enabled");
    } catch {
      setUiState(Notification.permission === "denied" ? "denied" : "disabled");
    }
  }

  async function disable() {
    setUiState("loading");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      if (reg) {
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
      setUiState("disabled");
    } catch {
      setUiState("enabled");
    }
  }

  if (uiState === "loading") {
    return <div className="h-6 w-11 animate-pulse rounded-full bg-velvet-700" />;
  }

  if (uiState === "denied") {
    return (
      <p className="text-sm text-velvet-400">{t("notificationsDenied")}</p>
    );
  }

  const isEnabled = uiState === "enabled";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-velvet-300">
        {isEnabled ? t("notificationsEnabled") : t("notificationsDisabled")}
      </span>
      <button
        type="button"
        onClick={isEnabled ? disable : enable}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
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
