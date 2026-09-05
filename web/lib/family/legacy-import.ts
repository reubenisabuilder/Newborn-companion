import { z } from "zod";

// Matches the export shape from the original single-file index.html
// (NC.exportData): { baby, appointments, healthLogs }. Onboarding-time
// import only — merging into an existing family is out of scope for v1.
const LegacyBabySchema = z.object({
  name: z.string().optional().default(""),
  dob: z.string().optional().nullable(),
  birthWeight: z.union([z.string(), z.number()]).optional().nullable(),
  weightUnit: z.enum(["kg", "lb"]).optional().default("kg"),
  gestationWeeks: z.union([z.string(), z.number()]).optional().nullable(),
});

const LegacyAppointmentSchema = z.object({
  type: z.string().optional().default("Other"),
  date: z.string(),
  time: z.string().optional().nullable(),
  title: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

const LegacyHealthLogSchema = z.object({
  type: z.enum(["weight", "jaundice", "temperature", "other"]),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional().default(""),
  date: z.string(),
  notes: z.string().optional().default(""),
});

export const LegacyExportSchema = z.object({
  baby: LegacyBabySchema.nullable().optional(),
  appointments: z.array(LegacyAppointmentSchema).optional().default([]),
  healthLogs: z.array(LegacyHealthLogSchema).optional().default([]),
});

export type LegacyExport = z.infer<typeof LegacyExportSchema>;

function toNumber(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeLegacyBaby(baby: LegacyExport["baby"]) {
  if (!baby) return null;
  return {
    name: baby.name ?? "",
    dob: baby.dob || null,
    birth_weight: toNumber(baby.birthWeight),
    weight_unit: baby.weightUnit ?? ("kg" as const),
    gestation_weeks: toNumber(baby.gestationWeeks),
  };
}
