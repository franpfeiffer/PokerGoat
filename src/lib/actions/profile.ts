"use server";

import {
  getUserByAuthId,
  createUserProfile,
  updateUserProfile,
  getUserStats,
  getDashboardStats,
  getUserProfitHistory,
  getUserStreak,
  getUserGroupComparison,
  getUserAchievementData,
  getUserPersonalRecords,
  type GroupComparisonStats,
} from "@/lib/db/queries/users";
import { revalidateLocalized } from "@/lib/utils/revalidate";

export async function getOrCreateProfile(data: {
  authUserId: string;
  displayName: string;
  avatarUrl?: string;
}) {
  let profile = await getUserByAuthId(data.authUserId);
  let isNew = false;

  if (!profile) {
    profile = await createUserProfile({
      authUserId: data.authUserId,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
    });
    isNew = true;
  }

  return { profile, isNew };
}

export async function getFullProfile(authUserId: string, displayName: string, avatarUrl?: string) {
  let profile = await getUserByAuthId(authUserId);
  if (!profile) {
    profile = await createUserProfile({ authUserId, displayName, avatarUrl });
  }

  const [stats, profitHistory, streak, groupComparison, achievementData, personalRecords] = await Promise.all([
    getUserStats(profile.id),
    getUserProfitHistory(profile.id),
    getUserStreak(profile.id),
    getUserGroupComparison(profile.id),
    getUserAchievementData(profile.id),
    getUserPersonalRecords(profile.id),
  ]);

  return { profile, stats, profitHistory, streak, groupComparison, achievementData, personalRecords };
}

export async function getProfileStats(userId: string) {
  return getUserStats(userId);
}

export async function getProfileProfitHistory(userId: string) {
  return getUserProfitHistory(userId);
}

export async function getProfileStreak(userId: string) {
  return getUserStreak(userId);
}

export async function getProfileGroupComparison(userId: string) {
  return getUserGroupComparison(userId);
}

export async function getDashboardStatsAction(authUserId: string) {
  const user = await getUserByAuthId(authUserId);
  if (!user) return null;
  return getDashboardStats(user.id);
}

export async function updateDisplayName(userId: string, formData: FormData) {
  const displayName = formData.get("displayName") as string;
  if (!displayName || displayName.length < 2 || displayName.length > 100) {
    return { error: "El nombre debe tener entre 2 y 100 caracteres" };
  }

  await updateUserProfile(userId, { displayName });
  revalidateLocalized("/profile");
  return { success: true };
}

export async function updateLocale(userId: string, locale: string) {
  if (locale !== "es" && locale !== "en") {
    return { error: "Idioma no válido" };
  }

  await updateUserProfile(userId, { locale });
  revalidateLocalized("/settings");
  return { success: true };
}

export async function updateBankAlias(userId: string, bankAlias: string | null) {
  if (bankAlias !== null && bankAlias.length > 200) {
    return { error: "El alias/CVU no puede superar los 200 caracteres" };
  }

  await updateUserProfile(userId, { bankAlias: bankAlias || null });
  revalidateLocalized("/profile");
  return { success: true };
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  try {
    await updateUserProfile(userId, { avatarUrl });
    revalidateLocalized("/profile");
    return { success: true };
  } catch (e) {
    console.error("updateAvatar failed:", e);
    return { error: "Error al actualizar la imagen" };
  }
}
