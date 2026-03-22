"use server";

import { auth } from "@/lib/auth/server";
import { getUserByAuthId } from "@/lib/db/queries/users";
import {
  getSubscriptionByUserId,
  createSubscriptionRecord,
} from "@/lib/db/queries/subscriptions";
import {
  createSubscription as mpCreateSubscription,
  cancelSubscription as mpCancelSubscription,
  SUBSCRIPTION_AMOUNT,
  SUBSCRIPTION_CURRENCY,
} from "@/lib/mercadopago";
import { revalidateLocalized } from "@/lib/utils/revalidate";

export async function getMySubscription() {
  const session = await auth!.getSession();
  const user = session?.data?.user;
  if (!user) return null;

  const profile = await getUserByAuthId(user.id);
  if (!profile) return null;

  return getSubscriptionByUserId(profile.id);
}

export async function startSubscription(backUrl: string) {
  const session = await auth!.getSession();
  const user = session?.data?.user;
  if (!user?.email) return { error: "No autenticado" };

  const profile = await getUserByAuthId(user.id);
  if (!profile) return { error: "Perfil no encontrado" };

  const existing = await getSubscriptionByUserId(profile.id);
  if (existing?.status === "authorized") {
    return { error: "Ya tienes una suscripción activa" };
  }

  try {
    const result = await mpCreateSubscription({
      payerEmail: user.email,
      backUrl,
    });

    if (!result.id || !result.init_point) {
      return { error: "Error al crear la suscripción" };
    }

    await createSubscriptionRecord({
      userId: profile.id,
      mpPreapprovalId: result.id,
      mpPayerEmail: user.email,
      amount: String(SUBSCRIPTION_AMOUNT),
      currency: SUBSCRIPTION_CURRENCY,
      status: "pending",
    });

    revalidateLocalized("/settings");
    return { initPoint: result.init_point };
  } catch {
    return { error: "Error al conectar con Mercado Pago" };
  }
}

export async function cancelMySubscription() {
  const session = await auth!.getSession();
  const user = session?.data?.user;
  if (!user) return { error: "No autenticado" };

  const profile = await getUserByAuthId(user.id);
  if (!profile) return { error: "Perfil no encontrado" };

  const sub = await getSubscriptionByUserId(profile.id);
  if (!sub?.mpPreapprovalId) return { error: "No hay suscripción activa" };

  try {
    await mpCancelSubscription(sub.mpPreapprovalId);
    revalidateLocalized("/settings");
    return { success: true };
  } catch {
    return { error: "Error al cancelar la suscripción" };
  }
}
