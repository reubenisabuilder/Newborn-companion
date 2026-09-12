import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, HealthLogType } from "@/lib/supabase/database.types";

export interface HealthLog {
  id: string;
  baby_id: string;
  type: HealthLogType;
  value: string;
  value_numeric: number | null;
  unit: string;
  date: string;
  notes: string;
}

// Only things a parent can genuinely measure at home and watch trend over
// time. A clinical-only reading like jaundice (bilirubin) isn't something
// anyone logs from a home device — it's a finding from a visit, which
// belongs as a Note on that appointment instead, not a metric here.
export const HEALTH_METRICS: { key: HealthLogType; label: string; unit: string }[] = [
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "height", label: "Length", unit: "cm" },
  { key: "head_circumference", label: "Head circumference", unit: "cm" },
];

export async function listHealthLogs(
  supabase: SupabaseClient<Database>,
  babyId: string
): Promise<HealthLog[]> {
  const { data } = await supabase
    .from("health_logs")
    .select("id, baby_id, type, value, value_numeric, unit, date, notes")
    .eq("baby_id", babyId)
    .order("date", { ascending: true });
  return data ?? [];
}
