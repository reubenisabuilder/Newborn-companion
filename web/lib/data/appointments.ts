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

export const APPOINTMENT_TYPES = ["Midwife", "Health Visitor", "Hospital", "GP", "Other", "Note"] as const;

/**
 * "Note" is not a scheduled visit — it's something noticed between
 * appointments (a hip click, something about her feet) that you want to
 * find again later. Same table, same search, same list — just no time,
 * and a lighter prompt on the title/notes fields.
 */
export function isStandaloneNote(type: string): boolean {
  return type === "Note";
}

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
