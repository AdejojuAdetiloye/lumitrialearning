import { AgeTier } from "@prisma/client";

export function ageInYears(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
  return age;
}

/**
 * Single pricing tier from date of birth (authoritative for enrollment).
 * Bands: 5–7 Rookies, 8–10 Explorers, 11–13 Ascent, 14–17 Veteran.
 */
export function resolveTierFromBirthDate(birthDate: Date): AgeTier | null {
  const age = ageInYears(birthDate);
  if (age < 5 || age > 17) return null;
  if (age <= 7) return AgeTier.ROOKIES;
  if (age <= 10) return AgeTier.EXPLORERS;
  if (age <= 13) return AgeTier.ASCENT;
  return AgeTier.VETERAN;
}

/** Returns whether the selected pricing tier is valid for the child's age. */
export function tierMatchesAge(tier: AgeTier, age: number): boolean {
  if (age < 5 || age > 17) return false;
  if (age >= 5 && age <= 7) return tier === AgeTier.ROOKIES;
  if (age >= 8 && age <= 9) return tier === AgeTier.EXPLORERS;
  // Age 10: allow Explorers or Ascent (overlap year)
  if (age === 10) return tier === AgeTier.EXPLORERS || tier === AgeTier.ASCENT;
  if (age >= 11 && age <= 13) return tier === AgeTier.ASCENT;
  if (age >= 14 && age <= 17) return tier === AgeTier.VETERAN;
  return false;
}
