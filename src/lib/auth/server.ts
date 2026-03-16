import { createNeonAuth } from "@neondatabase/auth/next/server";

function getAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl || !secret) {
    return null;
  }

  return createNeonAuth({
    baseUrl,
    cookies: {
      secret,
      sessionDataTtl: 300,
    },
  });
}

export const auth = getAuth();
