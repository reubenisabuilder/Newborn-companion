"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFamilyContext } from "@/lib/family/session";
import { parseTags } from "@/lib/data/appointments";

const AppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().trim().min(1).max(60),
  date: z.string().min(1),
  time: z.string().optional(),
  title: z.string().max(200).optional().default(""),
  notes: z.string().max(5000).optional().default(""),
  location: z.string().max(200).optional().default(""),
  tags: z.string().max(500).optional().default(""),
});

export interface AppointmentFormState {
  error?: string;
  success?: boolean;
}

export async function saveAppointmentAction(
  _prev: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const parsed = AppointmentSchema.safeParse({
    id: formData.get("id") || undefined,
    type: formData.get("type"),
    date: formData.get("date"),
    time: formData.get("time") || undefined,
    title: formData.get("title") || "",
    notes: formData.get("notes") || "",
    location: formData.get("location") || "",
    tags: formData.get("tags") || "",
  });
  if (!parsed.success) return { error: "Please check the form and try again." };

  // family_id/baby_id are re-derived from the session, never trusted from
  // the client — the client only says which appointment (by id) to edit.
  const { supabase, familyId, activeBaby } = await requireFamilyContext();
  if (!activeBaby) return { error: "Add a baby's details first." };

  const { id, ...fields } = parsed.data;
  const row = {
    family_id: familyId,
    baby_id: activeBaby.id,
    type: fields.type,
    date: fields.date,
    time: fields.time || null,
    title: fields.title,
    notes: fields.notes,
    location: fields.location,
    tags: parseTags(fields.tags),
  };

  const { error } = id
    ? await supabase.from("appointments").update(row).eq("id", id)
    : await supabase.from("appointments").insert(row);

  if (error) return { error: "Couldn't save that appointment. Please try again." };

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAppointmentAction(id: string) {
  const supabase = await createClient();
  await supabase.from("appointments").delete().eq("id", id);
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
}
