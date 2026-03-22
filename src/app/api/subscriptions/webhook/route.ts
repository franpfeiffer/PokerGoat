import { NextResponse } from "next/server";
import { getSubscription } from "@/lib/mercadopago";
import {
  getSubscriptionByPreapprovalId,
  updateSubscriptionStatus,
} from "@/lib/db/queries/subscriptions";

type MpStatus = "pending" | "authorized" | "paused" | "cancelled";

const STATUS_MAP: Record<string, MpStatus> = {
  pending: "pending",
  authorized: "authorized",
  paused: "paused",
  cancelled: "cancelled",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type !== "subscription_preapproval") {
      return NextResponse.json({ ok: true });
    }

    const preapprovalId = body.data?.id as string | undefined;
    if (!preapprovalId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const existing = await getSubscriptionByPreapprovalId(preapprovalId);
    if (!existing) {
      return NextResponse.json({ ok: true });
    }

    const mpSub = await getSubscription(preapprovalId);
    const newStatus = STATUS_MAP[mpSub.status ?? ""] ?? "pending";

    const autoRecurring = mpSub.auto_recurring as
      | { start_date?: string; end_date?: string }
      | undefined;

    await updateSubscriptionStatus(preapprovalId, {
      status: newStatus,
      currentPeriodStart: autoRecurring?.start_date
        ? new Date(autoRecurring.start_date)
        : undefined,
      currentPeriodEnd: autoRecurring?.end_date
        ? new Date(autoRecurring.end_date)
        : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
