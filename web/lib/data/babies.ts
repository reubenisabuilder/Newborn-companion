import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, WeightUnit } from "@/lib/supabase/database.types";

export interface Baby {
  id: string;
  family_id: string;
  name: string;
  dob: string | null;
  birth_weight: number | null;
  weight_unit: WeightUnit;
  gestation_weeks: number | null;
}

export async function getBaby(
  supabase: SupabaseClient<Database>,
  babyId: string
): Promise<Baby | null> {
  const { data } = await supabase
    .from("babies")
    .select("id, family_id, name, dob, birth_weight, weight_unit, gestation_weeks")
    .eq("id", babyId)
    .single();
  return data ?? null;
}

export async function createBaby(
  supabase: SupabaseClient<Database>,
  familyId: string,
  fields: { name: string; dob?: string | null }
) {
  return supabase
    .from("babies")
    .insert({ family_id: familyId, name: fields.name, dob: fields.dob || null })
    .select("id")
    .single();
}

export async function updateBaby(
  supabase: SupabaseClient<Database>,
  babyId: string,
  fields: Partial<Pick<Baby, "name" | "dob" | "birth_weight" | "weight_unit" | "gestation_weeks">>
) {
  return supabase.from("babies").update(fields).eq("id", babyId);
}

/** Converts a weight to kg for chart math. Values already in kg pass through. */
export function toKg(value: number, unit: WeightUnit): number {
  return unit === "lb" ? value * 0.45359237 : value;
}
