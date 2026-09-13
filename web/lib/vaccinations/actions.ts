"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFamilyContext } from "@/lib/family/session";
import { VACCINATION_SCHEDULE } from "@/lib/content/vaccinations";

const scheduleKeys = VACCINATION_SCHEDULE.map((s) => s.key) as [string, ...string[]];

const VaccinationSchema = z.object({
  schedule_key: z.enum(scheduleKeys),
  given_date: z.string().min(1),
  notes: z.string().max(2000).optional().default(""),
});

export interface VaccinationFormState {
  error?: string;
  success?: boolean;
}

// Upserts by (baby_id, schedule_key) — one row per schedule item per baby.
export async function saveVaccinationAction(
  _prev: VaccinationFormState,
  formData: FormData
): Promise<VaccinationFormState> {
  const parsed = VaccinationSchema.safeParse({
    schedule_key: formData.get("schedule_key"),
    given_date: formData.get("given_date"),
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) return { error: "Please check the form and try again." };

  const { supabase, familyId, activeBaby } = await requireFamilyContext();
  if (!activeBaby) return { error: "Add a baby's details first." };

  const { error } = await supabase.from("vaccinations").upsert(
    {
      family_id: familyId,
      baby_id: activeBaby.id,
      schedule_key: parsed.data.schedule_key,
      given_date: parsed.data.given_date,
      notes: parsed.data.notes,
    },
    { onConflict: "baby_id,schedule_key" }
  );

  if (error) return { error: "Couldn't save that. Please try again." };

  revalidatePath("/vaccinations");
  return { success: true };
}

export async function clearVaccinationAction(id: string) {
  const supabase = await createClient();
  await supabase.from("vaccinations").delete().eq("id", id);
  revalidatePath("/vaccinations");
}
