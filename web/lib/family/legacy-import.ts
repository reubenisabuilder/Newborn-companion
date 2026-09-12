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

const CURRENT_METRIC_TYPES = new Set(["weight", "temperature", "height", "head_circumference"]);

/**
 * The old app tracked jaundice/other as a home-logged metric; the new
 * schema doesn't (a bilirubin reading only ever comes from a clinical
 * visit, so it belongs as something to recall, not a trend to chart).
 * Rather than dropping that history on import, jaundice/other entries
 * become standalone Notes instead — same information, just filed where
 * it now belongs.
 */
export function splitLegacyHealthLogs(logs: LegacyExport["healthLogs"]) {
  const metrics: {
    type: "weight" | "temperature" | "height" | "head_circumference";
    value: string;
    unit: string;
    date: string;
    notes: string;
  }[] = [];
  const notes: { title: string; date: string; notes: string }[] = [];

  for (const log of logs) {
    if (CURRENT_METRIC_TYPES.has(log.type)) {
      metrics.push({
        type: log.type as "weight" | "temperature" | "height" | "head_circumference",
        value: String(log.value),
        unit: log.unit,
        date: log.date,
        notes: log.notes,
      });
    } else {
      const label = log.type.charAt(0).toUpperCase() + log.type.slice(1);
      const detail = [String(log.value), log.unit].filter(Boolean).join(" ");
      notes.push({
        title: label,
        date: log.date,
        notes: [detail, log.notes].filter(Boolean).join("\n\n"),
      });
    }
  }

  return { metrics, notes };
}
