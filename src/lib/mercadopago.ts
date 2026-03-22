import { MercadoPagoConfig, PreApproval } from "mercadopago";

function getClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;

  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10000 },
  });
}

function getPreApprovalApi() {
  const client = getClient();
  if (!client) return null;
  return new PreApproval(client);
}

export const SUBSCRIPTION_AMOUNT = 2999;
export const SUBSCRIPTION_CURRENCY = "ARS";

export async function createSubscription(params: {
  payerEmail: string;
  backUrl: string;
}) {
  const api = getPreApprovalApi();
  if (!api) throw new Error("Mercado Pago not configured");

  const result = await api.create({
    body: {
      reason: "PokerGoat PRO - Suscripción mensual",
      external_reference: params.payerEmail,
      payer_email: params.payerEmail,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: SUBSCRIPTION_AMOUNT,
        currency_id: SUBSCRIPTION_CURRENCY,
      },
      back_url: params.backUrl,
    },
  });

  return result;
}

export async function getSubscription(preapprovalId: string) {
  const api = getPreApprovalApi();
  if (!api) throw new Error("Mercado Pago not configured");

  return api.get({ id: preapprovalId });
}

export async function cancelSubscription(preapprovalId: string) {
  const api = getPreApprovalApi();
  if (!api) throw new Error("Mercado Pago not configured");

  return api.update({
    id: preapprovalId,
    body: { status: "cancelled" },
  });
}

export async function pauseSubscription(preapprovalId: string) {
  const api = getPreApprovalApi();
  if (!api) throw new Error("Mercado Pago not configured");

  return api.update({
    id: preapprovalId,
    body: { status: "paused" },
  });
}
