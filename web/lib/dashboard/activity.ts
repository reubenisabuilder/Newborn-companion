import type { Appointment } from "@/lib/data/appointments";
import type { HealthLog } from "@/lib/data/health";

export interface ActivityItem {
  id: string;
  date: string;
  icon: string;
  bg: string;
  title: string;
  sub: string;
  href: string;
}

export function buildActivityFeed(
  appointments: Appointment[],
  healthLogs: HealthLog[],
  limit = 6
): ActivityItem[] {
  const items: ActivityItem[] = [];

  appointments.forEach((a) =>
    items.push({
      id: a.id,
      date: a.date,
      icon: "📅",
      bg: "var(--c-appt-bg)",
      title: a.title || a.type,
      sub: a.notes || `${a.type} appointment`,
      href: `/appointments`,
    })
  );

  healthLogs.forEach((h) =>
    items.push({
      id: h.id,
      date: h.date,
      icon: "📈",
      bg: "var(--c-health-bg)",
      title: `${h.type[0].toUpperCase() + h.type.slice(1)}: ${h.value}${h.unit ? " " + h.unit : ""}`,
      sub: h.notes || "",
      href: `/health`,
    })
  );

  items.sort((a, b) => (b.date === a.date ? (a.id < b.id ? 1 : -1) : b.date.localeCompare(a.date)));
  return items.slice(0, limit);
}
