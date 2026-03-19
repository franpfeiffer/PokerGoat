"use server";

import { auth } from "@/lib/auth/server";

export async function checkIsAdmin(): Promise<boolean> {
  const { data: session } = await auth!.getSession();
  return session?.user?.email === process.env.ADMIN_EMAIL;
}
