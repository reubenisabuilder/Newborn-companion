"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireFamilyContext } from "@/lib/family/session";
import { LegacyExportSchema, normalizeLegacyBaby, splitLegacyHealthLogs } from "@/lib/family/legacy-import";

export interface CreateFamilyState {
  code?: string;
  error?: string;
}

export interface JoinFamilyState {
  error?: string;
}

async function ensureAnonymousSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
  return supabase;
}

export async function createFamilyAction(
  _prevState: CreateFamilyState,
  _formData: FormData
): Promise<CreateFamilyState> {
  const supabase = await ensureAnonymousSession();

  const { data, error } = await supabase.rpc("create_family");
  if (error || !data || data.length === 0) {
    return { error: "Couldn't create a family right now. Please try again." };
  }

  return { code: data[0].code };
}

export async function joinFamilyAction(
  _prevState: JoinFamilyState,
  formData: FormData
): Promise<JoinFamilyState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter the family code." };

  const supabase = await ensureAnonymousSession();

  const { data: familyId, error } = await supabase.rpc("join_family_by_code", {
    p_code: code,
  });

  if (error || !familyId) {
    return { error: "That code wasn't recognised. Double-check it and try again." };
  }

  redirect("/dashboard");
}

/** Called after the user has confirmed they've saved the family code. */
export async function confirmFamilyCreatedAction() {
  redirect("/dashboard");
}

export interface ImportBackupState {
  error?: string;
  imported?: boolean;
}

/**
 * Onboarding-time only: brings a JSON export from the original single-file
 * app into a family this device already belongs to. Re-importing later or
 * merging with existing data is out of scope for v1 (see the plan's open
 * questions) — this always creates one new baby.
 */
export async function importLegacyBackupAction(
  _prev: ImportBackupState,
  formData: FormData
): Promise<ImportBackupState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a backup file first." };
  }

  let parsed;
  try {
    const text = await file.text();
    parsed = LegacyExportSchema.parse(JSON.parse(text));
  } catch {
    return { error: "Couldn't read that file as a valid backup." };
  }

  const { supabase, familyId } = await requireFamilyContext();

  const babyFields = normalizeLegacyBaby(parsed.baby) ?? { name: "Baby" };
  const { data: baby, error: babyError } = await supabase
    .from("babies")
    .insert({ family_id: familyId, ...babyFields })
    .select("id")
    .single();

  if (babyError || !baby) return { error: "Couldn't create a baby from that backup." };

  if (parsed.appointments.length > 0) {
    await supabase.from("appointments").insert(
      parsed.appointments.map((a) => ({
        family_id: familyId,
        baby_id: baby.id,
        type: a.type,
        date: a.date,
        time: a.time || null,
        title: a.title,
        notes: a.notes,
      }))
    );
  }

  const { metrics, notes } = splitLegacyHealthLogs(parsed.healthLogs);

  if (metrics.length > 0) {
    await supabase.from("health_logs").insert(
      metrics.map((m) => ({
        family_id: familyId,
        baby_id: baby.id,
        type: m.type,
        value: m.value,
        unit: m.unit,
        date: m.date,
        notes: m.notes,
      }))
    );
  }

  if (notes.length > 0) {
    await supabase.from("appointments").insert(
      notes.map((n) => ({
        family_id: familyId,
        baby_id: baby.id,
        type: "Note",
        date: n.date,
        title: n.title,
        notes: n.notes,
      }))
    );
  }

  revalidatePath("/", "layout");
  return { imported: true };
}

export interface DeleteFamilyState {
  error?: string;
}

/**
 * Erases the family for EVERY linked member, not just this device. The
 * caller must have already confirmed by re-typing the baby's name — this
 * action doesn't re-check that text itself since it has no reliable way to
 * know which baby the user meant to type against; the confirmation step
 * lives in the UI, this just performs the (irreversible) delete once asked.
 */
export async function deleteFamilyAction(
  _prev: DeleteFamilyState,
  formData: FormData
): Promise<DeleteFamilyState> {
  const familyId = String(formData.get("familyId") ?? "");
  if (!familyId) return { error: "Missing family." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_my_family", { p_family_id: familyId });
  if (error) return { error: "Couldn't erase the family. Please try again." };

  redirect("/join");
}
