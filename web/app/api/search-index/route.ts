import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Feeds the client-side search modal. RLS scopes every query to the
// caller's own family; this route only resolves which baby's data to
// return (the active baby, same cookie the rest of the app uses).
export async function GET() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return Response.json({ appointments: [], healthLogs: [] });

  const { data: babies } = await supabase
    .from("babies")
    .select("id")
    .order("created_at", { ascending: true });

  const cookieStore = await cookies();
  const requestedBabyId = cookieStore.get("nc_baby_id")?.value;
  const babyId =
    (babies ?? []).find((b) => b.id === requestedBabyId)?.id ?? babies?.[0]?.id ?? null;

  if (!babyId) return Response.json({ appointments: [], healthLogs: [] });

  const [appointments, healthLogs] = await Promise.all([
    supabase.from("appointments").select("id, type, date, title, notes").eq("baby_id", babyId),
    supabase.from("health_logs").select("id, type, value, unit, date, notes").eq("baby_id", babyId),
  ]);

  return Response.json({
    appointments: appointments.data ?? [],
    healthLogs: healthLogs.data ?? [],
  });
}
