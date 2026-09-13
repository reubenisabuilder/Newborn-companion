import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export interface VaccinationRecord {
  id: string;
  baby_id: string;
  schedule_key: string;
  given_date: string | null;
  notes: string;
}

// Sparse: only schedule items a family has actually recorded something
// against come back here — see supabase/migrations/0002 for why.
export async function listVaccinationRecords(
  supabase: SupabaseClient<Database>,
  babyId: string
): Promise<VaccinationRecord[]> {
  const { data } = await supabase
    .from("vaccinations")
    .select("id, baby_id, schedule_key, given_date, notes")
    .eq("baby_id", babyId);
  return data ?? [];
}
