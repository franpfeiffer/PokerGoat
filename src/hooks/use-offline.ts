"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPendingUpdates,
  removePendingUpdate,
} from "@/lib/utils/offline-queue";
import { updateParticipant } from "@/lib/actions/nights";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      syncPending();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check pending on mount
    getPendingUpdates().then((updates) => setPendingCount(updates.length));

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncPending = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const updates = await getPendingUpdates();
      for (const update of updates) {
        try {
          if (update.action === "updateParticipant") {
            const formData = new FormData();
            for (const [key, value] of Object.entries(update.data)) {
              formData.set(key, value);
            }
            await updateParticipant(formData);
          }
          await removePendingUpdate(update.id);
          setPendingCount((c) => Math.max(0, c - 1));
        } catch {
          // Will retry next time
          break;
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return { isOffline, pendingCount, isSyncing, syncPending, setPendingCount };
}
