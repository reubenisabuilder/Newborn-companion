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

export const HEALTH_METRICS: { key: HealthLogType; label: string; unit: string }[] = [
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "jaundice", label: "Jaundice", unit: "µmol/L" },
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "other", label: "Other", unit: "" },
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
