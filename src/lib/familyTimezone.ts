import { addDays, format, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export type FamilyCountry = "nigeria" | "usa" | "canada" | "united-kingdom";

const FAMILY_TZ: Record<
  FamilyCountry,
  { iana: string; scheduleLabel: string; parentUiLabel: string; timeCode: string }
> = {
  nigeria: {
    iana: "Africa/Lagos",
    scheduleLabel: "Nigeria (West Africa Time, WAT)",
    parentUiLabel: "Your time (Nigeria)",
    timeCode: "WAT",
  },
  usa: {
    iana: "America/New_York",
    scheduleLabel: "United States (Eastern Time)",
    parentUiLabel: "Your time (US Eastern)",
    timeCode: "EST",
  },
  canada: {
    iana: "America/Toronto",
    scheduleLabel: "Canada (Eastern Time)",
    parentUiLabel: "Your time (Canada Eastern)",
    timeCode: "EST",
  },
  "united-kingdom": {
    iana: "Europe/London",
    scheduleLabel: "United Kingdom (London time)",
    parentUiLabel: "Your time (UK)",
    timeCode: "UK time",
  },
};

const NG_IANA = "Africa/Lagos";

export function getFamilyTimezoneConfig(country: string) {
  const key = country as FamilyCountry;
  return FAMILY_TZ[key] ?? FAMILY_TZ.nigeria;
}

/**
 * Given a target weekday (ISO 1–7, where 1 = Monday) and a country,
 * return the next local calendar date in that family's timezone as yyyy-MM-dd.
 * If the weekday is today, returns today.
 */
export function nextLocalDateForIsoWeekday(country: string, isoWeekday: number): string {
  const { iana } = getFamilyTimezoneConfig(country);
  const now = new Date();
  const todayIso = Number(formatInTimeZone(now, iana, "i")); // 1 (Mon) – 7 (Sun)
  const delta = (isoWeekday - todayIso + 7) % 7;
  const target = addDays(now, delta);
  return formatInTimeZone(target, iana, "yyyy-MM-dd");
}

/** Interpret yyyy-MM-dd + HH:mm as wall-clock in the family's timezone → UTC instant. */
export function wallClockInFamilyZoneToUtc(dateStr: string, timeStr: string, country: string): Date {
  const { iana } = getFamilyTimezoneConfig(country);
  const [Y, M, D] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  const localFields = new Date(Y, M - 1, D, h, mi, 0, 0);
  return fromZonedTime(localFields, iana);
}

/** If end is not after start on the same calendar date, roll end to the next local calendar day. */
export function familyWallEndToUtc(
  sessionDateStr: string,
  endTimeStr: string,
  country: string,
  startUtc: Date
): Date {
  let endUtc = wallClockInFamilyZoneToUtc(sessionDateStr, endTimeStr, country);
  if (endUtc.getTime() <= startUtc.getTime()) {
    const next = addDays(parseISO(sessionDateStr), 1);
    const nextStr = format(next, "yyyy-MM-dd");
    endUtc = wallClockInFamilyZoneToUtc(nextStr, endTimeStr, country);
  }
  return endUtc;
}

export type FamilySlotDisplay = {
  headlineDay: string;
  timeRange: string;
  zoneHint: string;
};

/** Kid-friendly: weekday only (no calendar date) + time range in regional time (WAT / EST / UK time). */
export function formatSlotForFamily(startIso: string, endIso: string, country: string): FamilySlotDisplay {
  const { iana, parentUiLabel, timeCode } = getFamilyTimezoneConfig(country);
  const start = new Date(startIso);
  const end = new Date(endIso);
  return {
    headlineDay: formatInTimeZone(start, iana, "EEEE"),
    timeRange: `${formatInTimeZone(start, iana, "h:mm a")} – ${formatInTimeZone(end, iana, "h:mm a")} ${timeCode}`,
    zoneHint: parentUiLabel,
  };
}

/** Admin / instructor line: weekday + time in Lagos (WAT), no calendar date. */
export function formatSlotInNigeria(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = formatInTimeZone(start, NG_IANA, "EEEE");
  const t1 = formatInTimeZone(start, NG_IANA, "h:mm a");
  const t2 = formatInTimeZone(end, NG_IANA, "h:mm a");
  return `${day}: ${t1} – ${t2} WAT (Nigeria / Lagos)`;
}

/** Admin “family” line: weekday + time in that region, no calendar date. */
export function formatSlotFamilyLine(startIso: string, endIso: string, country: string): string {
  const { iana, timeCode } = getFamilyTimezoneConfig(country);
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = formatInTimeZone(start, iana, "EEEE");
  const t1 = formatInTimeZone(start, iana, "h:mm a");
  const t2 = formatInTimeZone(end, iana, "h:mm a");
  return `${day}: ${t1} – ${t2} ${timeCode}`;
}

export type TimetableEntryLike = { startsAt: string };

/**
 * Sort timetable rows for display: Monday → Sunday in the family's timezone, then by local start time.
 */
export function sortTimetableByWeekdayInFamilyZone<T extends TimetableEntryLike>(
  entries: readonly T[],
  country: string
): T[] {
  if (entries.length <= 1) return [...entries];
  const { iana } = getFamilyTimezoneConfig(country);
  const decorated = entries.map((e) => {
    const start = new Date(e.startsAt);
    const isoWeekday = Number(formatInTimeZone(start, iana, "i")); // 1 = Mon … 7 = Sun
    const hour = Number(formatInTimeZone(start, iana, "H"));
    const minute = Number(formatInTimeZone(start, iana, "m"));
    const minutesOfDay = hour * 60 + minute;
    return { e, isoWeekday, minutesOfDay };
  });
  decorated.sort((a, b) => {
    if (a.isoWeekday !== b.isoWeekday) return a.isoWeekday - b.isoWeekday;
    if (a.minutesOfDay !== b.minutesOfDay) return a.minutesOfDay - b.minutesOfDay;
    return new Date(a.e.startsAt).getTime() - new Date(b.e.startsAt).getTime();
  });
  return decorated.map((d) => d.e);
}
