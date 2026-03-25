"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";

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

export function PushPermission() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied") return;

    async function subscribe() {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Si ya tiene una subscription activa, la registramos en el server (idempotente)
        let sub = await registration.pushManager.getSubscription();

        if (!sub) {
          if (Notification.permission !== "granted") {
            const perm = await Notification.requestPermission();
            if (perm !== "granted") return;
          }
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        const json = sub.toJSON();
        await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
          }),
        });
      } catch {
        // Silencioso — no interrumpir la app si falla
      }
    }

    subscribe();
  }, [session]);

  return null;
}
