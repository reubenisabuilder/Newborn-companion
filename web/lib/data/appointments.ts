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
  location: string;
}

// Starter suggestions offered before a family has typed any of their own —
// type is free text (see appointmentColorBucket below for why), not a
// fixed enum, so these are a helpful nudge rather than the only options.
export const APPOINTMENT_TYPES = ["Midwife", "Health Visitor", "Hospital", "GP", "Paediatrician", "Note"] as const;

// Real-world appointment types are open-ended (GP, paediatrician, health
// visitor, dentist, audiology...) so `type` is free text rather than a
// fixed enum a picker has to enumerate. Chip colour is instead inferred
// from loose keyword matching into a small, fixed set of buckets — new
// values a family types just fall into "other" rather than needing a
// schema/CSS change.
export function appointmentColorBucket(type: string): "gp" | "hospital" | "community" | "note" | "other" {
  const t = type.trim().toLowerCase();
  if (t === "note") return "note";
  if (/\bgp\b|doctor|general practi/.test(t)) return "gp";
  if (/hospital|consultant|paed|a&e|a & e|specialist/.test(t)) return "hospital";
  if (/midwife|health visitor|clinic|nurse/.test(t)) return "community";
  return "other";
}

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
    .select("id, baby_id, type, date, time, title, notes, location")
    .eq("baby_id", babyId)
    .order("date", { ascending: true });
  return data ?? [];
}
