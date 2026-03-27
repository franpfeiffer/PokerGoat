import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const RETRY_DELAYS = [500, 1500, 3000];

function isTransientError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message;
  if (msg.includes("fetch failed") || msg.includes("ETIMEDOUT")) return true;
  const cause = (e as { cause?: unknown }).cause;
  if (cause instanceof Error && (cause.message.includes("ETIMEDOUT") || cause.message.includes("fetch failed"))) return true;
  return false;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withRetry(sql: NeonQueryFunction<false, false>): NeonQueryFunction<false, false> {
  const runQuery: (
    ...args: Parameters<typeof sql>
  ) => ReturnType<typeof sql> = (...args) => sql(...args);

  return (async (...args: Parameters<typeof sql>) => {
    for (let attempt = 0; attempt < RETRY_DELAYS.length + 1; attempt++) {
      try {
        return await runQuery(...args);
      } catch (e: unknown) {
        if (!isTransientError(e) || attempt >= RETRY_DELAYS.length) throw e;
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }) as NeonQueryFunction<false, false>;
}

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null as unknown as ReturnType<typeof drizzle<typeof schema>>;
  }
  const sql = withRetry(neon(url));
  return drizzle(sql, { schema });
}

export const db = createDb();
