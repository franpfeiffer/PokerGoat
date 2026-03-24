import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { Serwist, StaleWhileRevalidate, NetworkFirst } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

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
