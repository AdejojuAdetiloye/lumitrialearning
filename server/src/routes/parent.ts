import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ageInYears, resolveTierFromBirthDate } from "../lib/tier.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Role } from "@prisma/client";

const router = Router();

router.use(authRequired, requireRole(Role.PARENT));

router.get("/profile", async (req: AuthedRequest, res) => {
  const profile = await prisma.parentProfile.findUnique({
    where: { userId: req.userId! },
    include: { user: { select: { email: true } } },
  });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  return res.json(profile);
});

router.get("/children", async (req: AuthedRequest, res) => {
  const profile = await prisma.parentProfile.findUnique({
    where: { userId: req.userId! },
    include: {
      children: {
        include: {
          subscriptions: { include: { course: true } },
        },
        orderBy: { firstName: "asc" },
      },
    },
  });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  return res.json(profile.children);
});

const childSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().datetime().optional(),
});

router.post("/children", async (req: AuthedRequest, res) => {
  const parsed = childSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const profile = await prisma.parentProfile.findUnique({ where: { userId: req.userId! } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const child = await prisma.child.create({
    data: {
      parentId: profile.id,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
    },
  });
  return res.status(201).json(child);
});

const patchChildSchema = z.object({
  birthDate: z.string().datetime(),
});

router.patch("/children/:childId", async (req: AuthedRequest, res) => {
  const childId = String(req.params.childId ?? "");
  const parsed = patchChildSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const profile = await prisma.parentProfile.findUnique({ where: { userId: req.userId! } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: profile.id },
  });
  if (!child) return res.status(404).json({ error: "Child not found" });
  const updated = await prisma.child.update({
    where: { id: childId },
    data: { birthDate: new Date(parsed.data.birthDate) },
  });
  return res.json(updated);
});

const enrollmentQuoteSchema = z.object({
  birthDate: z.string().datetime(),
  courseSlugs: z.array(z.string()).min(1),
});

/** Live total for birth-date tier × subjects (same prices as checkout). */
/** Unpaid Flutterwave checkouts: parent can resume without re-entering the form. */
router.get("/pending-payments", async (req: AuthedRequest, res) => {
  const pending = await prisma.payment.findMany({
    where: { parentUserId: req.userId!, status: "PENDING" },
    include: {
      lines: {
        include: {
          child: { select: { id: true, firstName: true, lastName: true } },
          course: { select: { id: true, slug: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    pending.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      totalAmount: p.totalAmount.toString(),
      currency: p.currency,
      lines: p.lines.map((l) => ({
        tier: l.tier,
        amount: l.amount.toString(),
        child: l.child,
        course: l.course,
      })),
    })),
  );
});

router.post("/enrollment-quote", async (req: AuthedRequest, res) => {
  const parsed = enrollmentQuoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const profile = await prisma.parentProfile.findUnique({ where: { userId: req.userId! } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const birth = new Date(parsed.data.birthDate);
  const tier = resolveTierFromBirthDate(birth);
  if (!tier) {
    const age = ageInYears(birth);
    return res.status(400).json({ error: `Age ${age} is outside the 5–17 range for our programs.` });
  }

  const { courseSlugs } = parsed.data;
  const country = profile.country;
  const uniqueSlugs = [...new Set(courseSlugs)];

  const priceRow = await prisma.tierPrice.findUnique({
    where: { country_tier: { country, tier } },
  });
  if (!priceRow) return res.status(400).json({ error: `No price for ${country} / ${tier}` });

  const unit = Number(priceRow.amount);
  const currency = priceRow.currency;
  const lines: { courseSlug: string; courseName: string; amount: number }[] = [];

  for (const slug of uniqueSlugs) {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) return res.status(400).json({ error: `Unknown course: ${slug}` });
    lines.push({ courseSlug: slug, courseName: course.name, amount: unit });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return res.json({ currency, unitPrice: unit, total, tier, lines });
});

router.get("/dashboard", async (req: AuthedRequest, res) => {
  const [profile, pendingPayments] = await Promise.all([
    prisma.parentProfile.findUnique({
      where: { userId: req.userId! },
      include: {
        children: {
          include: {
            subscriptions: {
              where: { status: "ACTIVE" },
              include: { course: true },
            },
            instructorAssignments: {
              include: {
                instructor: { select: { id: true, email: true, staffProfile: true } },
                course: { select: { id: true, slug: true, name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: { parentUserId: req.userId!, status: "PENDING" },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const now = new Date();
  const children = profile.children.map((c) => {
    const pending = pendingPayments.find((p) => p.lines.some((l) => l.childId === c.id));
    const needsEnrollmentPayment = c.subscriptions.length === 0;
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      birthDate: c.birthDate,
      needsEnrollmentPayment,
      pendingEnrollmentPayment: pending
        ? {
            id: pending.id,
            totalAmount: pending.totalAmount.toString(),
            currency: pending.currency,
          }
        : null,
      instructorAssignments: c.instructorAssignments.map((a) => ({
        id: a.id,
        instructor: a.instructor,
        course: a.course,
      })),
      subscriptions: c.subscriptions.map((s) => ({
        id: s.id,
        course: s.course,
        tier: s.tier,
        status: s.status,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        nextPaymentDue: s.currentPeriodEnd,
        msRemaining: Math.max(0, s.currentPeriodEnd.getTime() - now.getTime()),
      })),
    };
  });

  return res.json({ country: profile.country, children });
});

router.get("/timetable", async (req: AuthedRequest, res) => {
  const profile = await prisma.parentProfile.findUnique({
    where: { userId: req.userId! },
    include: {
      children: {
        include: {
          timetable: { orderBy: { startsAt: "asc" } },
        },
        orderBy: { firstName: "asc" },
      },
    },
  });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const grouped = profile.children.map((c) => ({
    childId: c.id,
    childName: `${c.firstName} ${c.lastName}`,
    entries: c.timetable,
  }));
  return res.json({ grouped });
});

router.get("/children/:childId/timetable", async (req: AuthedRequest, res) => {
  const childId = String(req.params.childId ?? "");
  const profile = await prisma.parentProfile.findUnique({ where: { userId: req.userId! } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: profile.id },
    include: { timetable: { orderBy: { startsAt: "asc" } } },
  });
  if (!child) return res.status(404).json({ error: "Child not found" });
  return res.json(child);
});

router.get("/child/:childId", async (req: AuthedRequest, res) => {
  const childId = String(req.params.childId ?? "");
  const profile = await prisma.parentProfile.findUnique({ where: { userId: req.userId! } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const now = new Date();
  const child = await prisma.child.findFirst({
    where: { id: childId, parentId: profile.id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { course: true },
        orderBy: { currentPeriodEnd: "asc" },
      },
      timetable: { orderBy: { startsAt: "asc" } },
      instructorAssignments: {
        include: {
          instructor: { select: { id: true, email: true, staffProfile: true } },
          course: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  });
  if (!child) return res.status(404).json({ error: "Child not found" });

  const subs = child.subscriptions.map((s) => ({
    id: s.id,
    course: s.course,
    tier: s.tier,
    currentPeriodStart: s.currentPeriodStart,
    currentPeriodEnd: s.currentPeriodEnd,
    amount: s.amount,
    currency: s.currency,
    msRemaining: Math.max(0, s.currentPeriodEnd.getTime() - now.getTime()),
  }));

  const ends = subs.map((s) => s.currentPeriodEnd.getTime()).filter((t) => t > now.getTime());
  const nextMs = ends.length ? Math.min(...ends) - now.getTime() : 0;

  return res.json({
    id: child.id,
    firstName: child.firstName,
    lastName: child.lastName,
    birthDate: child.birthDate,
    familyCountry: profile.country,
    instructorAssignments: child.instructorAssignments.map((a) => ({
      id: a.id,
      instructor: a.instructor,
      course: a.course,
    })),
    subscriptions: subs,
    timetable: child.timetable,
    nextPaymentAt: ends.length ? new Date(Math.min(...ends)).toISOString() : null,
    msToNextPayment: ends.length ? Math.max(0, nextMs) : 0,
  });
});

export default router;
