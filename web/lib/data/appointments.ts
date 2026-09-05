import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export interface Appointment {
  id: string;
  baby_id: string;
  type: string;
  date: string;
  time: string | null;
  title: string;
  notes: string;
}

export const APPOINTMENT_TYPES = ["Midwife", "Health Visitor", "Hospital", "GP", "Other"] as const;

export async function listAppointments(
  supabase: SupabaseClient<Database>,
  babyId: string
): Promise<Appointment[]> {
  const { data } = await supabase
    .from("appointments")
    .select("id, baby_id, type, date, time, title, notes")
    .eq("baby_id", babyId)
    .order("date", { ascending: true });
  return data ?? [];
}
