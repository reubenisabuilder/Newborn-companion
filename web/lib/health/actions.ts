"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFamilyContext } from "@/lib/family/session";

const HealthLogSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["weight", "temperature", "height", "head_circumference"]),
  value: z.string().min(1),
  unit: z.string().max(20).optional().default(""),
  date: z.string().min(1),
  notes: z.string().max(5000).optional().default(""),
});

export interface HealthLogFormState {
  error?: string;
  success?: boolean;
}

export async function saveHealthLogAction(
  _prev: HealthLogFormState,
  formData: FormData
): Promise<HealthLogFormState> {
  const parsed = HealthLogSchema.safeParse({
    id: formData.get("id") || undefined,
    type: formData.get("type"),
    value: formData.get("value"),
    unit: formData.get("unit") || "",
    date: formData.get("date"),
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) return { error: "Please check the form and try again." };

  const { supabase, familyId, activeBaby } = await requireFamilyContext();
  if (!activeBaby) return { error: "Add a baby's details first." };

  const { id, ...fields } = parsed.data;
  const row = {
    family_id: familyId,
    baby_id: activeBaby.id,
    type: fields.type,
    value: fields.value.trim(),
    unit: fields.unit.trim(),
    date: fields.date,
    notes: fields.notes,
  };

  const { error } = id
    ? await supabase.from("health_logs").update(row).eq("id", id)
    : await supabase.from("health_logs").insert(row);

  if (error) return { error: "Couldn't save that entry. Please try again." };

  revalidatePath("/health");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteHealthLogAction(id: string) {
  const supabase = await createClient();
  await supabase.from("health_logs").delete().eq("id", id);
  revalidatePath("/health");
  revalidatePath("/dashboard");
}
