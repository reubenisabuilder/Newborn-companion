// Ported from the original index.html's age/week helpers, unchanged logic.
import type { Baby } from "@/lib/data/babies";

export function todayStr(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function ageWords(days: number): string {
  const weeks = Math.floor(days / 7);
  const remDays = days % 7;
  if (weeks === 0) return `${days} day${days === 1 ? "" : "s"} old`;
  return `${weeks} week${weeks === 1 ? "" : "s"}, ${remDays} day${remDays === 1 ? "" : "s"} old`;
}

export function isPremature(baby: Pick<Baby, "gestation_weeks"> | null): boolean {
  return !!(
    baby &&
    baby.gestation_weeks &&
    baby.gestation_weeks > 0 &&
    baby.gestation_weeks < 37
  );
}

export function adjustedDaysFor(
  baby: Pick<Baby, "dob" | "gestation_weeks">,
  dateStr: string
): number {
  const gw = baby.gestation_weeks ?? 40;
  const daysEarly = Math.round((40 - gw) * 7);
  return daysBetween(baby.dob!, dateStr) - daysEarly;
}

export function ageString(baby: Baby | null): string {
  if (!baby || !baby.dob) return "";
  const days = daysBetween(baby.dob, todayStr());
  if (days < 0) return "Due " + baby.dob;
  let base = days === 0 ? "Born today 🎉" : ageWords(days);
  if (isPremature(baby)) {
    const adj = adjustedDaysFor(baby, todayStr());
    base += adj >= 0 ? ` · adjusted age: ${ageWords(adj)}` : ` · adjusted age: not yet at due date`;
  }
  return base;
}

/** Index into a WEEK_GUIDE-shaped array (weeks 1-12 buckets). */
export function currentWeekIdx(baby: Baby | null): number {
  if (!baby || !baby.dob) return 0;
  let days = daysBetween(baby.dob, todayStr());
  if (isPremature(baby)) days = Math.max(adjustedDaysFor(baby, todayStr()), 0);
  const week = Math.floor(days / 7);
  if (week <= 0) return 0;
  if (week === 1) return 1;
  if (week <= 3) return 2;
  if (week <= 5) return 3;
  if (week <= 7) return 4;
  return 5;
}
