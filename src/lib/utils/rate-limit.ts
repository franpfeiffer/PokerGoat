/**
 * In-process rate limiter using a sliding window algorithm.
 * Works well for Next.js server actions where the process persists between requests.
 * For multi-instance deployments, use a shared store like Redis instead.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory growth
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.timestamps.length === 0 || now - entry.timestamps[entry.timestamps.length - 1] > 60_000) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

/**
 * Check if a key has exceeded the rate limit.
 * @param key - Unique identifier (e.g. userId + action)
 * @param limit - Max number of requests
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited (blocked), false if allowed
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return true;
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return false;
}
