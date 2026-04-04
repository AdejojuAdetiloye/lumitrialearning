import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ParentSalutation, Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authRequired } from "../middleware/auth.js";
import { resolvePricingRegion } from "../lib/resolvePricingRegion.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  salutation: z.nativeEnum(ParentSalutation),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const parts = [
      ...flat.formErrors,
      ...Object.entries(flat.fieldErrors).flatMap(([key, msgs]) =>
        (msgs ?? []).map((m) => `${key}: ${m}`)
      ),
    ];
    return res.status(400).json({ error: parts.join(" ") || "Invalid registration data" });
  }
  const { email, password, salutation, firstName, lastName, phone } = parsed.data;
  const emailNorm = email.trim().toLowerCase();
  const firstNorm = firstName.trim();
  const lastNorm = lastName.trim();
  // Country is inferred automatically for pricing consistency across the funnel.
  // Client-supplied country (if any) is ignored.
  const country = await resolvePricingRegion(req);
  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: emailNorm,
      passwordHash,
      role: Role.PARENT,
      parentProfile: {
        create: {
          salutation,
          firstName: firstNorm,
          lastName: lastNorm,
          phone: phone?.trim() ? phone.trim() : null,
          country,
        },
      },
    },
    include: { parentProfile: true },
  });
  const token = signToken(user.id, user.role);
  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.parentProfile,
    },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { parentProfile: true, staffProfile: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken(user.id, user.role);
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.parentProfile,
      staffProfile: user.staffProfile,
    },
  });
});

router.get("/me", authRequired, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    include: { parentProfile: { include: { children: true } }, staffProfile: true },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.parentProfile,
    staffProfile: user.staffProfile,
  });
});

export default router;
