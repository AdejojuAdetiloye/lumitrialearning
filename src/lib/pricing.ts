import { api } from "./api";

/**
 * Tier ↔ pricing rows (same index for NGN / USD / CAD / GBP):
 * Rookies 5–7 → ₦50k | $40 | C$50 | £30
 * Explorers 8–10 → ₦60k | $45 | C$60 | £35
 * Ascent 10–13 → ₦70k | $50 | C$70 | £40
 * Veteran 14–17 → ₦80k | $60 | C$80 | £45
 *
 * Public UI should load live amounts via fetchPublicTierPricing() / usePublicPricing();
 * COUNTRY_PRICING is the offline fallback when the API is unavailable.
 */
export type SupportedCountry = "nigeria" | "usa" | "canada" | "united-kingdom";

export type TierId = "rookies" | "explorers" | "ascent" | "veteran";

export type TierDefinition = {
  id: TierId;
  name: string;
  ageRange: string;
  description: string;
};

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    id: "rookies",
    name: "Rookies",
    ageRange: "Age 5-7",
    description: "Foundation learning with engaging guided sessions.",
  },
  {
    id: "explorers",
    name: "Explorers",
    ageRange: "Age 8-10",
    description: "Confidence-building classes for growing learners.",
  },
  {
    id: "ascent",
    name: "Ascent",
    ageRange: "Age 10-13",
    description: "Structured progression with deeper skill practice.",
  },
  {
    id: "veteran",
    name: "Veteran",
    ageRange: "Age 14-17",
    description: "Advanced track with stronger challenge and mastery.",
  },
];

export type CountryPricing = {
  label: string;
  currencyCode: "NGN" | "USD" | "CAD" | "GBP";
  locale: string;
  prices: Record<TierId, number | null>;
};

const API_TIER_KEYS = ["ROOKIES", "EXPLORERS", "ASCENT", "VETERAN"] as const;
const FRONT_TIER_IDS: TierId[] = ["rookies", "explorers", "ascent", "veteran"];

export type LocalizedPricingApiResponse = {
  region: SupportedCountry;
  displayLabel: string;
  locale: string;
  currencyCode: CountryPricing["currencyCode"];
  tiers: Record<TierId, { amount: string; currency: string }>;
};

export type LocalizedPricing = {
  country: SupportedCountry;
  pricing: CountryPricing;
};

/** Maps GET /api/pricing JSON to a single-country shape; null if incomplete. */
export function localizedPricingFromApi(data: LocalizedPricingApiResponse): LocalizedPricing | null {
  if (!data.region) return null;
  const prices: Record<TierId, number | null> = {
    rookies: null,
    explorers: null,
    ascent: null,
    veteran: null,
  };

  for (const tierId of FRONT_TIER_IDS) {
    const cell = data.tiers[tierId];
    if (!cell?.amount) return null;
    const n = Number(cell.amount);
    if (Number.isNaN(n)) return null;
    prices[tierId] = n;
  }

  return {
    country: data.region,
    pricing: {
      label: data.displayLabel,
      currencyCode: data.currencyCode,
      locale: data.locale,
      prices,
    },
  };
}

export async function fetchPublicTierPricing(): Promise<LocalizedPricing | null> {
  try {
    const data = await api.get<LocalizedPricingApiResponse>("/api/pricing");
    return localizedPricingFromApi(data);
  } catch {
    return null;
  }
}

export const COUNTRY_PRICING: Record<SupportedCountry, CountryPricing> = {
  nigeria: {
    label: "Nigeria",
    currencyCode: "NGN",
    locale: "en-NG",
    prices: {
      rookies: 50000,
      explorers: 60000,
      ascent: 70000,
      veteran: 80000,
    },
  },
  usa: {
    label: "USA",
    currencyCode: "USD",
    locale: "en-US",
    prices: {
      rookies: 40.0,
      explorers: 45.0,
      ascent: 50.0,
      veteran: 60.0,
    },
  },
  canada: {
    label: "Canada",
    currencyCode: "CAD",
    locale: "en-CA",
    prices: {
      rookies: 50.0,
      explorers: 60.0,
      ascent: 70.0,
      veteran: 80.0,
    },
  },
  "united-kingdom": {
    label: "United Kingdom",
    currencyCode: "GBP",
    locale: "en-GB",
    prices: {
      rookies: 30.0,
      explorers: 35.0,
      ascent: 40.0,
      veteran: 45.0,
    },
  },
};

export const COUNTRY_OPTIONS: { value: SupportedCountry; label: string }[] = [
  { value: "nigeria", label: "Nigeria" },
  { value: "usa", label: "USA" },
  { value: "canada", label: "Canada" },
  { value: "united-kingdom", label: "United Kingdom" },
];

export const formatLocalizedPrice = (
  country: SupportedCountry,
  amount: number | null,
  countryPricing?: CountryPricing
): string => {
  if (amount === null) {
    return "To be set";
  }
  const config = countryPricing ?? COUNTRY_PRICING[country];
  const fractionDigits = config.currencyCode === "NGN" ? 0 : 2;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
};

export const normalizeCountry = (rawCountry: string): SupportedCountry | null => {
  if (!rawCountry) return null;

  const value = rawCountry.toLowerCase();
  const aliases: Record<string, SupportedCountry> = {
    nigeria: "nigeria",
    usa: "usa",
    "united-states": "usa",
    "united-states-of-america": "usa",
    canada: "canada",
    uk: "united-kingdom",
    "united-kingdom": "united-kingdom",
    britain: "united-kingdom",
    england: "united-kingdom",
  };

  return aliases[value] ?? null;
};
