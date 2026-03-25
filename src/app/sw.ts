import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { Serwist, StaleWhileRevalidate, NetworkFirst } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// Push notification listener
self.addEventListener("push", (event) => {
  const sw = self as unknown as {
    registration: { showNotification(title: string, opts: object): Promise<void> };
  };
  const pushEvent = event as unknown as {
    data: { json(): unknown } | null;
    waitUntil(p: Promise<unknown>): void;
  };
  if (!pushEvent.data) return;

  let payload: { title: string; body: string; url?: string; icon?: string };
  try {
    payload = pushEvent.data.json() as typeof payload;
  } catch {
    return;
  }

  pushEvent.waitUntil(
    sw.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? "/icons/casino-chips.png",
      badge: "/icons/casino-chips.png",
      data: { url: payload.url },
    })
  );
});

// Click en notificación — abre la URL
self.addEventListener("notificationclick", (event) => {
  const sw = self as unknown as {
    clients: {
      matchAll(opts: object): Promise<{ navigate(url: string): void; focus(): Promise<unknown> }[]>;
      openWindow(url: string): Promise<unknown>;
    };
  };
  const notifEvent = event as unknown as {
    notification: { close(): void; data: { url?: string } };
    waitUntil(p: Promise<unknown>): void;
  };
  notifEvent.notification.close();
  const url = notifEvent.notification.data?.url;
  if (!url) return;

  notifEvent.waitUntil(
    sw.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            (client as unknown as { navigate(u: string): void }).navigate(url);
            return (client as unknown as { focus(): Promise<unknown> }).focus();
          }
        }
        return sw.clients.openWindow(url);
      })
  );
});

const nightPageCache: RuntimeCaching = {
  matcher: ({ url }) => /\/groups\/[^/]+\/nights\/[^/]+$/.test(url.pathname),
  handler: new StaleWhileRevalidate({
    cacheName: "night-pages",
  }),
};

const appPageCache: RuntimeCaching = {
  matcher: ({ url }) => /\/(es|en)\/(dashboard|groups)/.test(url.pathname),
  handler: new NetworkFirst({
    cacheName: "app-pages",
    networkTimeoutSeconds: 5,
  }),
};

const serwist = new Serwist({
  precacheEntries: (self as unknown as { __SW_MANIFEST: (PrecacheEntry | string)[] | undefined }).__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [nightPageCache, appPageCache, ...defaultCache],
});

serwist.addEventListeners();
