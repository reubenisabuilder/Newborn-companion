"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BabyDetailsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100).default(""),
  dob: z.string().optional().default(""),
  birthWeight: z.string().optional().default(""),
  weightUnit: z.enum(["kg", "lb"]).default("kg"),
  gestationWeeks: z.string().optional().default(""),
});

export interface SaveBabyState {
  error?: string;
}

export async function saveBabyDetailsAction(
  _prev: SaveBabyState,
  formData: FormData
): Promise<SaveBabyState> {
  const parsed = BabyDetailsSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") ?? "",
    dob: formData.get("dob") ?? "",
    birthWeight: formData.get("birthWeight") ?? "",
    weightUnit: formData.get("weightUnit") ?? "kg",
    gestationWeeks: formData.get("gestationWeeks") ?? "",
  });
  if (!parsed.success) return { error: "Please check the form and try again." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("babies")
    .update({
      name: parsed.data.name.trim(),
      dob: parsed.data.dob || null,
      birth_weight: parsed.data.birthWeight ? parseFloat(parsed.data.birthWeight) : null,
      weight_unit: parsed.data.weightUnit,
      gestation_weeks: parsed.data.gestationWeeks ? parseFloat(parsed.data.gestationWeeks) : null,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: "Couldn't save. Please try again." };

  revalidatePath("/", "layout");
  return {};
}

export async function setActiveBabyAction(babyId: string) {
  const cookieStore = await cookies();
  cookieStore.set("nc_baby_id", babyId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

export async function addBabyAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("family_members")
    .select("family_id")
    .limit(1);
  const familyId = memberships?.[0]?.family_id;
  if (!familyId) redirect("/join");

  const { data } = await supabase
    .from("babies")
    .insert({ family_id: familyId, name })
    .select("id")
    .single();

  if (data) {
    const cookieStore = await cookies();
    cookieStore.set("nc_baby_id", data.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  revalidatePath("/", "layout");
}
