/**
 * Maps visitor location (IP country/continent or browser timezone) to one of the
 * four supported pricing regions. Broader regions use the closest market:
 * Africa → Nigeria, Americas (non-CA) → USA, Europe → UK, other → USA (USD).
 */

export type SupportedPricingCountry = "nigeria" | "usa" | "canada" | "united-kingdom";

const US_LIKE = new Set([
  "US",
  "PR",
  "GU",
  "AS",
  "MP",
  "VI",
  "UM",
]);

const UK_LIKE = new Set(["GB", "GG", "JE", "IM"]);

export function mapIpToPricingRegion(countryCode: string, continentCode: string): SupportedPricingCountry {
  const cc = (countryCode || "").toUpperCase();
  const cont = (continentCode || "").toUpperCase();

  if (cc === "CA") return "canada";
  if (cc === "NG") return "nigeria";
  if (US_LIKE.has(cc)) return "usa";
  if (UK_LIKE.has(cc)) return "united-kingdom";

  if (cont === "AF") return "nigeria";
  if (cont === "NA") return cc === "CA" ? "canada" : "usa";
  if (cont === "EU") return "united-kingdom";

  if (cont === "SA" || cont === "AS" || cont === "OC" || cont === "AN") return "usa";

  return "usa";
}

/** When IP is unavailable (localhost / private), infer from IANA timezone. */
export function mapTimeZoneToPricingRegion(tz: string | undefined | null): SupportedPricingCountry | null {
  if (!tz || typeof tz !== "string") return null;
  if (tz.startsWith("Africa/")) return "nigeria";
  if (tz.startsWith("Europe/") || tz === "Atlantic/Reykjavik") return "united-kingdom";

  if (tz.startsWith("America/")) {
    const canadian = /\/(Toronto|Vancouver|Winnipeg|Edmonton|Regina|Halifax|St_Johns|Moncton|Whitehorse|Yellowknife|Iqaluit|Thunder_Bay|Glace_Bay|Goose_Bay|Blanc-Sablon|Dawson|Fort_Nelson|Inuvik|Cambridge_Bay|Creston|Dawson_Creek|Pangnirtung|Rankin_Inlet|Resolute|Swift_Current|Atikokan|Nipigon|Rainy_River)$/;
    if (canadian.test(tz)) return "canada";
    return "usa";
  }

  if (tz.startsWith("Pacific/") || tz.startsWith("Australia/") || tz.startsWith("Asia/") || tz.startsWith("Indian/"))
    return "usa";

  return null;
}

export function extractClientIp(req: { headers: Record<string, string | string[] | undefined>; socket: { remoteAddress?: string | null } }): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  const fromForwarded =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : Array.isArray(forwarded)
        ? forwarded[0]?.trim()
        : null;
  const realIp = req.headers["x-real-ip"];
  const cf = req.headers["cf-connecting-ip"];
  const candidate =
    fromForwarded ||
    (typeof realIp === "string" ? realIp : null) ||
    (typeof cf === "string" ? cf : null) ||
    req.socket.remoteAddress ||
    null;
  if (!candidate) return null;
  return candidate.replace(/^::ffff:/i, "");
}

export function isNonPublicIp(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  const m = /^172\.(\d+)\./.exec(ip);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:")) return true;
  return false;
}
