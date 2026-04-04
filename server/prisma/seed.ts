import "dotenv/config";
import { PrismaClient, AgeTier, ParentSalutation, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { coursesForSeed } from "../../src/lib/programCategories.js";

const prisma = new PrismaClient();

const tierPrices: { country: string; tier: AgeTier; amount: number; currency: string }[] = [
  // Nigeria NGN
  { country: "nigeria", tier: "ROOKIES", amount: 50000, currency: "NGN" },
  { country: "nigeria", tier: "EXPLORERS", amount: 60000, currency: "NGN" },
  { country: "nigeria", tier: "ASCENT", amount: 70000, currency: "NGN" },
  { country: "nigeria", tier: "VETERAN", amount: 80000, currency: "NGN" },
  // USA USD
  { country: "usa", tier: "ROOKIES", amount: 40, currency: "USD" },
  { country: "usa", tier: "EXPLORERS", amount: 45, currency: "USD" },
  { country: "usa", tier: "ASCENT", amount: 50, currency: "USD" },
  { country: "usa", tier: "VETERAN", amount: 60, currency: "USD" },
  // Canada CAD
  { country: "canada", tier: "ROOKIES", amount: 50, currency: "CAD" },
  { country: "canada", tier: "EXPLORERS", amount: 60, currency: "CAD" },
  { country: "canada", tier: "ASCENT", amount: 70, currency: "CAD" },
  { country: "canada", tier: "VETERAN", amount: 80, currency: "CAD" },
  // UK GBP
  { country: "united-kingdom", tier: "ROOKIES", amount: 30, currency: "GBP" },
  { country: "united-kingdom", tier: "EXPLORERS", amount: 35, currency: "GBP" },
  { country: "united-kingdom", tier: "ASCENT", amount: 40, currency: "GBP" },
  { country: "united-kingdom", tier: "VETERAN", amount: 45, currency: "GBP" },
];

async function main() {
  const courses = coursesForSeed();

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }

  for (const tp of tierPrices) {
    await prisma.tierPrice.upsert({
      where: { country_tier: { country: tp.country, tier: tp.tier } },
      update: { amount: tp.amount, currency: tp.currency },
      create: {
        country: tp.country,
        tier: tp.tier,
        amount: tp.amount,
        currency: tp.currency,
      },
    });
  }

  // Must match login: emails are stored and looked up in lowercase
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@lumitrialearning.org").trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD ?? "ChangeMeAdmin123!").trim();
  const hash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hash, role: Role.ADMIN },
    create: {
      email: adminEmail,
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  const adminFirstName = process.env.ADMIN_FIRST_NAME?.trim();
  const adminLastName = process.env.ADMIN_LAST_NAME?.trim();
  if (adminFirstName && adminLastName) {
    await prisma.staffProfile.upsert({
      where: { userId: adminUser.id },
      update: { firstName: adminFirstName, lastName: adminLastName },
      create: {
        userId: adminUser.id,
        firstName: adminFirstName,
        lastName: adminLastName,
      },
    });
  }

  const seedParentEmail = process.env.SEED_PARENT_EMAIL?.trim().toLowerCase();
  const seedParentPassword = process.env.SEED_PARENT_PASSWORD?.trim();
  if (seedParentEmail && seedParentPassword && seedParentPassword.length >= 8) {
    const parentHash = await bcrypt.hash(seedParentPassword, 12);
    const existing = await prisma.user.findUnique({
      where: { email: seedParentEmail },
      include: { parentProfile: true },
    });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: seedParentEmail,
          passwordHash: parentHash,
          role: Role.PARENT,
          parentProfile: {
            create: {
              salutation: ParentSalutation.MR,
              firstName: "Demo",
              lastName: "Parent",
              country: "nigeria",
              phone: null,
            },
          },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash: parentHash, role: Role.PARENT },
      });
      if (!existing.parentProfile) {
        await prisma.parentProfile.create({
          data: {
            userId: existing.id,
            salutation: ParentSalutation.MR,
            firstName: "Demo",
            lastName: "Parent",
            country: "nigeria",
            phone: null,
          },
        });
      }
    }
    console.log("Seed OK. Parent login email:", seedParentEmail, "(password from SEED_PARENT_PASSWORD in .env)");
  }

  console.log("Seed OK. Admin login email:", adminEmail, "(password from ADMIN_PASSWORD in .env)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
