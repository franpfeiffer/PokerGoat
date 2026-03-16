"use server";

import { revalidatePath } from "next/cache";
import {
  getUserByAuthId,
  createUserProfile,
  updateUserProfile,
  getUserStats,
} from "@/lib/db/queries/users";

export async function getOrCreateProfile(data: {
  authUserId: string;
  displayName: string;
  avatarUrl?: string;
}) {
  let profile = await getUserByAuthId(data.authUserId);

  if (!profile) {
    profile = await createUserProfile({
      authUserId: data.authUserId,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
    });
  }

  return profile;
}

export async function getProfileStats(userId: string) {
  return getUserStats(userId);
}

export async function updateDisplayName(userId: string, formData: FormData) {
  const displayName = formData.get("displayName") as string;
  if (!displayName || displayName.length < 2 || displayName.length > 100) {
    return { error: "El nombre debe tener entre 2 y 100 caracteres" };
  }

  await updateUserProfile(userId, { displayName });
  revalidatePath("/profile");
  return { success: true };
}

export async function updateLocale(userId: string, locale: string) {
  if (locale !== "es" && locale !== "en") {
    return { error: "Idioma no válido" };
  }

  await updateUserProfile(userId, { locale });
  revalidatePath("/settings");
  return { success: true };
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  await updateUserProfile(userId, { avatarUrl });
  revalidatePath("/profile");
  return { success: true };
}
