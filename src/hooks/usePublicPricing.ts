import { useEffect, useState } from "react";
import {
  COUNTRY_PRICING,
  fetchPublicTierPricing,
  type CountryPricing,
  type SupportedCountry,
} from "@/lib/pricing";

export type PublicLocalizedPricing = {
  country: SupportedCountry;
  pricing: CountryPricing;
};

/** Live tier prices from GET /api/pricing, falling back to static COUNTRY_PRICING. */
export function usePublicPricing() {
  const [state, setState] = useState<PublicLocalizedPricing>({
    country: "nigeria",
    pricing: COUNTRY_PRICING.nigeria,
  });

  useEffect(() => {
    let cancelled = false;
    fetchPublicTierPricing().then((parsed) => {
      if (!cancelled && parsed) setState(parsed);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
