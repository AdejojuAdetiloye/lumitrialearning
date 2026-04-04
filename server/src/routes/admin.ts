import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AgeTier, Prisma, Role, SubscriptionStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

const adminOnly = [authRequired, requireRole(Role.ADMIN)] as const;
const adminOrManager = [authRequired, requireRole(Role.ADMIN, Role.MANAGER)] as const;

router.get("/tier-prices", ...adminOnly, async (_req, res) => {
  const rows = await prisma.tierPrice.findMany({
    orderBy: [{ country: "asc" }, { tier: "asc" }],
  });
  return res.json(rows);
});

const upsertTierPriceSchema = z.object({
  country: z.string().min(1),
  tier: z.nativeEnum(AgeTier),
  amount: z.number().positive(),
  currency: z.string().min(1).max(8),
});

router.put("/tier-prices", ...adminOnly, async (req, res) => {
  const parsed = upsertTierPriceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { country, tier, amount, currency } = parsed.data;
  const row = await prisma.tierPrice.upsert({
    where: { country_tier: { country, tier } },
    create: { country, tier, amount, currency },
    update: { amount, currency },
  });
  return res.json(row);
});

const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["MANAGER", "INSTRUCTOR"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

/** ADMIN only: create manager or instructor accounts. */
router.post("/staff-users", ...adminOnly, async (req, res) => {
  const parsed = createStaffSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, role: staffRole, firstName, lastName } = parsed.data;
  const emailNorm = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) return res.status(409).json({ error: "Email already registered" });
  const passwordHash = await bcrypt.hash(password, 12);
  const prismaRole = staffRole === "MANAGER" ? Role.MANAGER : Role.INSTRUCTOR;
  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      passwordHash,
      role: prismaRole,
      staffProfile: {
        create: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      },
    },
    include: { staffProfile: true },
  });
  return res.status(201).json({
    id: user.id,
    email: user.email,
    role: user.role,
    staffProfile: user.staffProfile,
  });
});

router.get("/staff-users", ...adminOnly, async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: { in: [Role.MANAGER, Role.INSTRUCTOR] } },
    include: { staffProfile: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json(users);
});

router.get("/instructors", ...adminOrManager, async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: Role.INSTRUCTOR },
    include: { staffProfile: true },
    orderBy: { createdAt: "asc" },
  });
  return res.json(users);
});

const assignSchema = z.object({
  childId: z.string().min(1),
  instructorId: z.string().min(1),
  courseId: z.string().min(1),
});

router.post("/instructor-assignments", ...adminOrManager, async (req, res) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { childId, instructorId, courseId } = parsed.data;
  const instructor = await prisma.user.findUnique({ where: { id: instructorId } });
  if (!instructor || instructor.role !== Role.INSTRUCTOR) {
    return res.status(400).json({ error: "User is not an instructor" });
  }
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return res.status(404).json({ error: "Child not found" });
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: "Program not found" });
  try {
    const row = await prisma.instructorAssignment.create({
      data: { childId, courseId, instructorId },
      include: {
        instructor: { include: { staffProfile: true } },
        child: true,
        course: { select: { id: true, slug: true, name: true } },
      },
    });
    return res.status(201).json(row);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({
        error: "That instructor is already assigned to this child for this program.",
      });
    }
    throw e;
  }
});

router.delete("/instructor-assignments/:id", ...adminOrManager, async (req, res) => {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  await prisma.instructorAssignment.delete({ where: { id } });
  return res.status(204).send();
});

router.get("/overview", ...adminOrManager, async (_req, res) => {
  const [parentsCount, childrenCount, paymentsSum, activeSubs] = await Promise.all([
    prisma.parentProfile.count(),
    prisma.child.count(),
    prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { totalAmount: true } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);
  return res.json({
    parentsCount,
    childrenCount,
    totalPaid: paymentsSum._sum.totalAmount?.toString() ?? "0",
    activeSubscriptions: activeSubs,
  });
});

function subscriptionCoversCurrentMonth(sub: {
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}): boolean {
  if (sub.status !== SubscriptionStatus.ACTIVE) return false;
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return sub.currentPeriodStart <= endOfMonth && sub.currentPeriodEnd >= startOfMonth;
}

router.get("/parents", ...adminOrManager, async (_req, res) => {
  const parents = await prisma.parentProfile.findMany({
    include: {
      user: { select: { email: true, createdAt: true } },
      children: {
        include: {
          subscriptions: { include: { course: true } },
          timetable: { orderBy: { startsAt: "asc" } },
          instructorAssignments: {
            include: {
              instructor: { select: { id: true, email: true, staffProfile: true } },
              course: { select: { id: true, slug: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = parents.map((p) => {
    const paidCurrentMonth = p.children.some((child) =>
      child.subscriptions.some((sub) => subscriptionCoversCurrentMonth(sub)),
    );
    return { ...p, paidCurrentMonth };
  });

  return res.json(enriched);
});

router.get("/payments", ...adminOrManager, async (_req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { email: true } },
      lines: {
        include: {
          child: true,
          course: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return res.json(payments);
});

const timetableSchema = z.object({
  childId: z.string(),
  title: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  meetingLink: z.string().url(),
});

router.post("/timetable", ...adminOrManager, async (req, res) => {
  const parsed = timetableSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const child = await prisma.child.findUnique({ where: { id: parsed.data.childId } });
  if (!child) return res.status(404).json({ error: "Child not found" });
  const entry = await prisma.timetableEntry.create({
    data: {
      childId: parsed.data.childId,
      title: parsed.data.title,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      meetingLink: parsed.data.meetingLink,
    },
  });
  return res.status(201).json(entry);
});

const updateTimetableSchema = z.object({
  childId: z.string().optional(),
  title: z.string().min(1).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  meetingLink: z.string().url().optional(),
});

router.put("/timetable/:id", ...adminOrManager, async (req, res) => {
  const parsed = updateTimetableSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  const data: {
    childId?: string;
    title?: string;
    startsAt?: Date;
    endsAt?: Date;
    meetingLink?: string;
  } = {};
  if (d.childId) data.childId = d.childId;
  if (d.title) data.title = d.title;
  if (d.startsAt) data.startsAt = new Date(d.startsAt);
  if (d.endsAt) data.endsAt = new Date(d.endsAt);
  if (d.meetingLink) data.meetingLink = d.meetingLink;
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  const tid = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const entry = await prisma.timetableEntry.update({
    where: { id: tid },
    data,
  });
  return res.json(entry);
});

router.delete("/timetable/:id", ...adminOrManager, async (req, res) => {
  const tid = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  await prisma.timetableEntry.delete({ where: { id: tid } });
  return res.status(204).send();
});

const courseSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers, and hyphens only");

router.get("/courses", ...adminOrManager, async (_req, res) => {
  const courses = await prisma.course.findMany({ orderBy: { name: "asc" } });
  return res.json(courses);
});

const createCourseSchema = z.object({
  slug: courseSlugSchema,
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
});

router.post("/courses", ...adminOnly, async (req, res) => {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { slug, name, description } = parsed.data;
  try {
    const course = await prisma.course.create({
      data: {
        slug,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });
    return res.status(201).json(course);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "A program with this slug already exists." });
    }
    throw e;
  }
});

const updateCourseSchema = z.object({
  slug: courseSlugSchema.optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
});

router.put("/courses/:id", ...adminOnly, async (req, res) => {
  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const d = parsed.data;
  const data: { slug?: string; name?: string; description?: string | null } = {};
  if (d.slug !== undefined) data.slug = d.slug;
  if (d.name !== undefined) data.name = d.name.trim();
  if (d.description !== undefined) data.description = d.description?.trim() ?? null;
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  try {
    const course = await prisma.course.update({ where: { id }, data });
    return res.json(course);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return res.status(404).json({ error: "Program not found" });
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "Another program already uses this slug." });
    }
    throw e;
  }
});

router.delete("/courses/:id", ...adminOnly, async (req, res) => {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  try {
    await prisma.course.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return res.status(404).json({ error: "Program not found" });
    }
    // e.g. referenced by subscriptions/assignments/payments.
    // Depending on the connector/driver, FK violations can surface as:
    // - KnownRequestError P2003, or
    // - UnknownRequestError with a Postgres SQLSTATE (seen in logs as 23001 / RESTRICT).
    const inUseMessage =
      "This program is in use (linked to subscriptions, assignments, or payments) and cannot be deleted. Archive it instead or remove dependent records first.";

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return res.status(409).json({ error: inUseMessage });
    }

    if (e instanceof Prisma.PrismaClientUnknownRequestError) {
      const msg = typeof e.message === "string" ? e.message : "";
      if (
        msg.includes("violates RESTRICT setting of foreign key constraint") ||
        msg.includes("is referenced from table")
      ) {
        return res.status(409).json({ error: inUseMessage });
      }
    }

    if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
      const msg = (e as { message: string }).message;
      if (
        msg.includes("violates RESTRICT setting of foreign key constraint") ||
        msg.includes("is referenced from table")
      ) {
        return res.status(409).json({ error: inUseMessage });
      }
    }

    console.error(e);
    return res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
