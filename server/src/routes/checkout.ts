import { Router } from "express";
import { z } from "zod";
import { AgeTier, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { ageInYears, resolveTierFromBirthDate, tierMatchesAge } from "../lib/tier.js";
import { sameCalendarDayUtc } from "../lib/dates.js";
import { initializeStandardPayment, verifyTransactionById, verifyTransactionByReference } from "../lib/flutterwave.js";
import { completePaymentFromFlutterwaveVerification } from "../lib/paymentCompletion.js";

const router = Router();

router.use(authRequired, requireRole(Role.PARENT));

const itemSchema = z.object({
  childId: z.string(),
  courseSlug: z.string(),
  tier: z.nativeEnum(AgeTier),
});

const enrollmentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().datetime(),
  courseSlugs: z.array(z.string()).min(1),
});

const redirectUrlSchema = z.string().url();

const createOrderSchema = z.union([
  z.object({ items: z.array(itemSchema).min(1), redirectUrl: redirectUrlSchema }),
  z.object({ enrollment: enrollmentSchema, redirectUrl: redirectUrlSchema }),
]);

const resumePaymentSchema = z.object({
  paymentId: z.string().min(1),
  redirectUrl: redirectUrlSchema,
});

function isAllowedAppRedirect(url: string): boolean {
  const origins = (process.env.CORS_ORIGINS ?? "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  return origins.some((o) => {
    try {
      return new URL(o).origin === u.origin;
    } catch {
      return false;
    }
  });
}

router.post("/create-order", async (req: AuthedRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (!isAllowedAppRedirect(parsed.data.redirectUrl)) {
    return res.status(400).json({ error: "redirectUrl origin is not allowed" });
  }

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: req.userId! },
    include: { children: true },
  });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const country = profile.country;
  const lines: {
    childId: string;
    courseId: string;
    tier: AgeTier;
    amount: number;
    currency: string;
  }[] = [];

  if ("enrollment" in parsed.data) {
    const e = parsed.data.enrollment;
    const birthDate = new Date(e.birthDate);
    const tier = resolveTierFromBirthDate(birthDate);
    if (!tier) {
      const age = ageInYears(birthDate);
      return res.status(400).json({
        error: `Age ${age} is outside tutored range (5–17). Check the birth date.`,
      });
    }

    const priceRow = await prisma.tierPrice.findUnique({
      where: { country_tier: { country, tier } },
    });
    if (!priceRow) {
      return res.status(400).json({ error: `No price for ${country} / ${tier}` });
    }
    const unit = Number(priceRow.amount);
    const currency = priceRow.currency;

    const fn = e.firstName.trim();
    const ln = e.lastName.trim();
    const fnKey = fn.toLowerCase();
    const lnKey = ln.toLowerCase();

    const siblingCandidates = await prisma.child.findMany({
      where: { parentId: profile.id, birthDate: { not: null } },
    });
    const existingChild = siblingCandidates.find(
      (c) =>
        c.birthDate != null &&
        c.firstName.trim().toLowerCase() === fnKey &&
        c.lastName.trim().toLowerCase() === lnKey &&
        sameCalendarDayUtc(c.birthDate, birthDate),
    );

    const child =
      existingChild ??
      (await prisma.child.create({
        data: {
          parentId: profile.id,
          firstName: fn,
          lastName: ln,
          birthDate,
        },
      }));

    if (existingChild) {
      await prisma.payment.updateMany({
        where: {
          parentUserId: req.userId!,
          status: PaymentStatus.PENDING,
          lines: { some: { childId: child.id } },
        },
        data: { status: PaymentStatus.FAILED },
      });
    }

    const slugs = [...new Set(e.courseSlugs)];
    for (const slug of slugs) {
      const course = await prisma.course.findUnique({ where: { slug } });
      if (!course) return res.status(400).json({ error: `Unknown course: ${slug}` });
      lines.push({
        childId: child.id,
        courseId: course.id,
        tier,
        amount: unit,
        currency,
      });
    }
  } else {
    const itemChildIds = [...new Set(parsed.data.items.map((i) => i.childId))];
    for (const cid of itemChildIds) {
      const child = profile.children.find((c) => c.id === cid);
      if (!child) return res.status(400).json({ error: `Child not found: ${cid}` });
      if (!child.birthDate) {
        return res.status(400).json({
          error: "This child needs a birth date before you can pay. Add it in Pay now or when creating the child.",
        });
      }
    }

    await prisma.payment.updateMany({
      where: {
        parentUserId: req.userId!,
        status: PaymentStatus.PENDING,
        lines: { some: { childId: { in: itemChildIds } } },
      },
      data: { status: PaymentStatus.FAILED },
    });

    for (const item of parsed.data.items) {
      const child = profile.children.find((c) => c.id === item.childId)!;
      const course = await prisma.course.findUnique({ where: { slug: item.courseSlug } });
      if (!course) return res.status(400).json({ error: `Unknown course: ${item.courseSlug}` });

      const realAge = ageInYears(child.birthDate!);
      if (!tierMatchesAge(item.tier, realAge)) {
        return res.status(400).json({
          error: `Tier ${item.tier} does not match child age (${realAge})`,
        });
      }

      const priceRow = await prisma.tierPrice.findUnique({
        where: { country_tier: { country, tier: item.tier } },
      });
      if (!priceRow) {
        return res.status(400).json({ error: `No price for ${country} / ${item.tier}` });
      }

      lines.push({
        childId: child.id,
        courseId: course.id,
        tier: item.tier,
        amount: Number(priceRow.amount),
        currency: priceRow.currency,
      });
    }
  }

  const currency = lines[0].currency;
  if (lines.some((l) => l.currency !== currency)) {
    return res.status(400).json({ error: "Mixed currencies" });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);

  const payment = await prisma.payment.create({
    data: {
      parentUserId: req.userId!,
      status: PaymentStatus.PENDING,
      totalAmount: total,
      currency,
      lines: {
        create: lines.map((l) => ({
          childId: l.childId,
          courseId: l.courseId,
          tier: l.tier,
          amount: l.amount,
        })),
      },
    },
  });

  const txRef = payment.id;
  const customerName = `${profile.firstName} ${profile.lastName}`.trim() || user.email;

  try {
    const { link } = await initializeStandardPayment({
      txRef,
      amount: total,
      currency,
      redirectUrl: parsed.data.redirectUrl,
      customer: {
        email: user.email,
        name: customerName,
        ...(profile.phone ? { phone_number: profile.phone } : {}),
      },
      meta: { payment_id: payment.id },
    });

    return res.json({
      paymentId: payment.id,
      checkoutLink: link,
      currency,
      value: total,
      txRef,
    });
  } catch (e: unknown) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    const msg = e instanceof Error ? e.message : "Flutterwave error";
    return res.status(502).json({ error: msg });
  }
});

/** Replace a stale pending payment with a new one (new Flutterwave tx_ref) and return a fresh checkout link. */
router.post("/resume-payment", async (req: AuthedRequest, res) => {
  const parsed = resumePaymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (!isAllowedAppRedirect(parsed.data.redirectUrl)) {
    return res.status(400).json({ error: "redirectUrl origin is not allowed" });
  }

  const old = await prisma.payment.findFirst({
    where: {
      id: parsed.data.paymentId,
      parentUserId: req.userId!,
      status: PaymentStatus.PENDING,
    },
    include: { lines: true },
  });
  if (!old || old.lines.length === 0) {
    return res.status(404).json({ error: "No pending payment found" });
  }

  const profile = await prisma.parentProfile.findUnique({ where: { userId: req.userId! } });
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!profile || !user) return res.status(404).json({ error: "Profile not found" });

  const total = Number(old.totalAmount);
  const currency = old.currency;

  let newPaymentId: string | undefined;
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: old.id },
      data: { status: PaymentStatus.FAILED },
    });
    const created = await tx.payment.create({
      data: {
        parentUserId: req.userId!,
        status: PaymentStatus.PENDING,
        totalAmount: old.totalAmount,
        currency,
        lines: {
          create: old.lines.map((l) => ({
            childId: l.childId,
            courseId: l.courseId,
            tier: l.tier,
            amount: l.amount,
          })),
        },
      },
    });
    newPaymentId = created.id;
  });

  const customerName = `${profile.firstName} ${profile.lastName}`.trim() || user.email;

  try {
    const { link } = await initializeStandardPayment({
      txRef: newPaymentId!,
      amount: total,
      currency,
      redirectUrl: parsed.data.redirectUrl,
      customer: {
        email: user.email,
        name: customerName,
        ...(profile.phone ? { phone_number: profile.phone } : {}),
      },
      meta: { payment_id: newPaymentId!, resumed_from: old.id },
    });

    return res.json({
      paymentId: newPaymentId,
      checkoutLink: link,
      currency,
      value: total,
      txRef: newPaymentId,
    });
  } catch (e: unknown) {
    if (newPaymentId) {
      await prisma.payment.update({
        where: { id: newPaymentId },
        data: { status: PaymentStatus.FAILED },
      });
    }
    const msg = e instanceof Error ? e.message : "Flutterwave error";
    return res.status(502).json({ error: msg });
  }
});

const verifySchema = z
  .object({
    transaction_id: z.string().min(1).optional(),
    tx_ref: z.string().min(1).optional(),
  })
  .refine((d) => Boolean(d.transaction_id || d.tx_ref), { message: "transaction_id or tx_ref required" });

router.post("/flutterwave-verify", async (req: AuthedRequest, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  let verified =
    parsed.data.transaction_id != null
      ? await verifyTransactionById(parsed.data.transaction_id)
      : null;

  if (!verified && parsed.data.tx_ref) {
    verified = await verifyTransactionByReference(parsed.data.tx_ref);
  }

  if (!verified) {
    return res.status(404).json({ error: "Transaction could not be verified" });
  }

  const paymentId = verified.tx_ref;
  const result = await completePaymentFromFlutterwaveVerification(paymentId, verified, {
    parentUserId: req.userId!,
  });

  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ ok: true, paymentId });
});

export default router;
