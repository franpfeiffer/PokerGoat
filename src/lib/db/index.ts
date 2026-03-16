import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function withRetry(sql: NeonQueryFunction<false, false>): NeonQueryFunction<false, false> {
  return (async (...args: Parameters<typeof sql>) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await (sql as Function)(...args);
      } catch (e: unknown) {
        const isTimeout =
          e instanceof Error &&
          (e.message.includes("fetch failed") || e.message.includes("ETIMEDOUT"));
        if (!isTimeout || attempt === 2) throw e;
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
