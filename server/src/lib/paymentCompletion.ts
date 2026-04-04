import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import { prisma } from "./prisma.js";
import type { FlutterwaveVerifyData } from "./flutterwave.js";

function chargedAmount(v: FlutterwaveVerifyData): number {
  return v.charged_amount != null ? v.charged_amount : v.amount;
}

/**
 * After Flutterwave confirms success (verify API or trusted webhook + verify), activate subscriptions.
 * Idempotent if payment is already COMPLETED.
 */
export async function completePaymentFromFlutterwaveVerification(
  paymentId: string,
  verified: FlutterwaveVerifyData,
  options?: { parentUserId?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (verified.status !== "successful") {
    return { ok: false, error: "Payment was not successful" };
  }
  if (verified.tx_ref !== paymentId) {
    return { ok: false, error: "Transaction reference does not match this payment" };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { lines: true },
  });

  if (!payment) {
    return { ok: false, error: "Payment not found" };
  }
  if (options?.parentUserId && payment.parentUserId !== options.parentUserId) {
    return { ok: false, error: "Forbidden" };
  }
  if (payment.status === PaymentStatus.COMPLETED) {
    return { ok: true };
  }
  if (payment.status !== PaymentStatus.PENDING) {
    return { ok: false, error: "Payment is not pending" };
  }

  const expected = Number(payment.totalAmount);
  const cur = payment.currency.toUpperCase();
  if (verified.currency.toUpperCase() !== cur) {
    return { ok: false, error: "Currency mismatch" };
  }

  const paid = chargedAmount(verified);
  if (paid + 0.01 < expected) {
    return { ok: false, error: "Paid amount does not match order total" };
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        rawPayload: { flutterwave: verified } as object,
      },
    });

    for (const line of payment.lines) {
      await tx.subscription.upsert({
        where: {
          childId_courseId: { childId: line.childId, courseId: line.courseId },
        },
        create: {
          childId: line.childId,
          courseId: line.courseId,
          tier: line.tier,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          amount: line.amount,
          currency: payment.currency,
          lastPaymentAt: now,
        },
        update: {
          tier: line.tier,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          amount: line.amount,
          currency: payment.currency,
          lastPaymentAt: now,
        },
      });
    }
  });

  return { ok: true };
}
