/**
 * One-off: inspect TierPrice country + currency alignment. Run: npx tsx scripts/check-tier-prices.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const expected: Record<string, string> = {
  nigeria: "NGN",
  usa: "USD",
  canada: "CAD",
  "united-kingdom": "GBP",
};

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.tierPrice.findMany({
      orderBy: [{ country: "asc" }, { tier: "asc" }],
    });

    if (rows.length === 0) {
      console.log("No TierPrice rows in the database. Run: npm run db:seed");
      return;
    }

    console.log(`Found ${rows.length} tier price row(s).\n`);

    const byCountry = new Map<string, typeof rows>();
    for (const r of rows) {
      const list = byCountry.get(r.country) ?? [];
      list.push(r);
      byCountry.set(r.country, list);
    }

    for (const [country, list] of [...byCountry.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const currencies = new Set(list.map((r) => r.currency));
      const exp = expected[country];
      const ok =
        exp !== undefined &&
        currencies.size === 1 &&
        currencies.has(exp) &&
        list.every((r) => r.currency === exp);

      console.log(
        `• ${country}: currency ${[...currencies].join(", ")} ${exp ? `(expected ${exp})` : "(no expected map)"} ${ok ? "✓" : "⚠ MISMATCH or unexpected"}`
      );
      for (const r of list) {
        console.log(`    ${r.tier}: ${r.amount} ${r.currency}`);
      }
      console.log("");
    }

    const unknownCountries = [...byCountry.keys()].filter((c) => expected[c] === undefined);
    if (unknownCountries.length) {
      console.log("Warning: unknown country keys (not in app regions):", unknownCountries.join(", "));
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
