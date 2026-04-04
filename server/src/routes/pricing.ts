import { Router } from "express";
import { AgeTier } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { resolvePricingRegion } from "../lib/resolvePricingRegion.js";
import type { SupportedPricingCountry } from "../lib/pricingRegion.js";

const router = Router();

const TIER_ORDER: AgeTier[] = [AgeTier.ROOKIES, AgeTier.EXPLORERS, AgeTier.ASCENT, AgeTier.VETERAN];
const FRONT_TIER_KEYS = ["rookies", "explorers", "ascent", "veteran"] as const;

const REGION_META: Record<
  SupportedPricingCountry,
  { displayLabel: string; locale: string; currencyCode: string }
> = {
  nigeria: { displayLabel: "Nigeria", locale: "en-NG", currencyCode: "NGN" },
  usa: { displayLabel: "United States", locale: "en-US", currencyCode: "USD" },
  canada: { displayLabel: "Canada", locale: "en-CA", currencyCode: "CAD" },
  "united-kingdom": { displayLabel: "United Kingdom", locale: "en-GB", currencyCode: "GBP" },
};

const STATIC_FALLBACK: Record<SupportedPricingCountry, Record<AgeTier, { amount: string; currency: string }>> = {
  nigeria: {
    [AgeTier.ROOKIES]: { amount: "50000", currency: "NGN" },
    [AgeTier.EXPLORERS]: { amount: "60000", currency: "NGN" },
    [AgeTier.ASCENT]: { amount: "70000", currency: "NGN" },
    [AgeTier.VETERAN]: { amount: "80000", currency: "NGN" },
  },
  usa: {
    [AgeTier.ROOKIES]: { amount: "40", currency: "USD" },
    [AgeTier.EXPLORERS]: { amount: "45", currency: "USD" },
    [AgeTier.ASCENT]: { amount: "50", currency: "USD" },
    [AgeTier.VETERAN]: { amount: "60", currency: "USD" },
  },
  canada: {
    [AgeTier.ROOKIES]: { amount: "50", currency: "CAD" },
    [AgeTier.EXPLORERS]: { amount: "60", currency: "CAD" },
    [AgeTier.ASCENT]: { amount: "70", currency: "CAD" },
    [AgeTier.VETERAN]: { amount: "80", currency: "CAD" },
  },
  "united-kingdom": {
    [AgeTier.ROOKIES]: { amount: "30", currency: "GBP" },
    [AgeTier.EXPLORERS]: { amount: "35", currency: "GBP" },
    [AgeTier.ASCENT]: { amount: "40", currency: "GBP" },
    [AgeTier.VETERAN]: { amount: "45", currency: "GBP" },
  },
};

/** Public: course list */
router.get("/courses", async (_req, res) => {
  const courses = await prisma.course.findMany({ orderBy: { name: "asc" } });
  return res.json(courses);
});

/**
 * Public: tier prices for the visitor's region only (IP + optional X-Client-Timezone).
 * Does not expose other countries' pricing.
 */
router.get("/", async (req, res) => {
  const region = await resolvePricingRegion(req);
  const meta = REGION_META[region];
  const rows = await prisma.tierPrice.findMany({ where: { country: region } });
  const byTier = new Map(rows.map((r) => [r.tier, r]));

  const tiers: Record<(typeof FRONT_TIER_KEYS)[number], { amount: string; currency: string }> = {
    rookies: STATIC_FALLBACK[region][AgeTier.ROOKIES],
    explorers: STATIC_FALLBACK[region][AgeTier.EXPLORERS],
    ascent: STATIC_FALLBACK[region][AgeTier.ASCENT],
    veteran: STATIC_FALLBACK[region][AgeTier.VETERAN],
  };

  for (let i = 0; i < TIER_ORDER.length; i++) {
    const tier = TIER_ORDER[i];
    const row = byTier.get(tier);
    if (row) {
      tiers[FRONT_TIER_KEYS[i]] = { amount: row.amount.toString(), currency: row.currency };
    }
  }

  let currencyCode = meta.currencyCode;
  const first = tiers.rookies;
  if (first?.currency) currencyCode = first.currency;

  return res.json({
    region,
    displayLabel: meta.displayLabel,
    locale: meta.locale,
    currencyCode,
    tiers,
  });
});

/**
 * Public: tier prices for the visitor's region only (IP + optional X-Client-Timezone).
 * Does not expose other countries' pricing.
 */
router.get("/localized", async (req, res) => {
  const region = await resolvePricingRegion(req);
  const meta = REGION_META[region];
  const rows = await prisma.tierPrice.findMany({ where: { country: region } });
  const byTier = new Map(rows.map((r) => [r.tier, r]));

  const tiers: Record<(typeof FRONT_TIER_KEYS)[number], { amount: string; currency: string }> = {
    rookies: STATIC_FALLBACK[region][AgeTier.ROOKIES],
    explorers: STATIC_FALLBACK[region][AgeTier.EXPLORERS],
    ascent: STATIC_FALLBACK[region][AgeTier.ASCENT],
    veteran: STATIC_FALLBACK[region][AgeTier.VETERAN],
  };

  for (let i = 0; i < TIER_ORDER.length; i++) {
    const tier = TIER_ORDER[i];
    const row = byTier.get(tier);
    if (row) {
      tiers[FRONT_TIER_KEYS[i]] = { amount: row.amount.toString(), currency: row.currency };
    }
  }

  let currencyCode = meta.currencyCode;
  const first = tiers.rookies;
  if (first?.currency) currencyCode = first.currency;

  return res.json({
    region,
    displayLabel: meta.displayLabel,
    locale: meta.locale,
    currencyCode,
    tiers,
  });
});

export default router;
