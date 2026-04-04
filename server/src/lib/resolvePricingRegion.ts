import type { Request } from "express";
import {
  extractClientIp,
  isNonPublicIp,
  mapIpToPricingRegion,
  mapTimeZoneToPricingRegion,
  type SupportedPricingCountry,
} from "./pricingRegion.js";

type IpWhoPayload = {
  success?: boolean;
  country_code?: string;
  continent_code?: string;
};

async function lookupIpWho(ip: string): Promise<{ country_code: string; continent_code: string } | null> {
  try {
    const url = `https://ipwho.is/${encodeURIComponent(ip)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return null;
    const data = (await res.json()) as IpWhoPayload;
    if (!data.success || !data.country_code || !data.continent_code) return null;
    return { country_code: data.country_code, continent_code: data.continent_code };
  } catch {
    return null;
  }
}

/**
 * Resolves pricing region: public IP geolocation when possible, else client timezone header, else Nigeria.
 */
export async function resolvePricingRegion(req: Request): Promise<SupportedPricingCountry> {
  const tzHeader = req.headers["x-client-timezone"];
  const clientTz = typeof tzHeader === "string" ? tzHeader.trim() : null;

  const ip = extractClientIp(req);
  if (ip && !isNonPublicIp(ip)) {
    const geo = await lookupIpWho(ip);
    if (geo) {
      return mapIpToPricingRegion(geo.country_code, geo.continent_code);
    }
  }

  const fromTz = mapTimeZoneToPricingRegion(clientTz);
  if (fromTz) return fromTz;

  return "nigeria";
}
