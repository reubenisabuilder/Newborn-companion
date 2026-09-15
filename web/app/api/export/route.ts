import { createClient } from "@/lib/supabase/server";

// Exports everything this family can see. RLS scopes the queries below to
// the caller's own family — no explicit family_id filter needed here, but
// that also means this route is only ever as safe as the RLS policies it
// relies on (verified separately against a live Postgres, see
// supabase/migrations/0001_init.sql).
export async function GET() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return new Response("Unauthorized", { status: 401 });

  const [babies, appointments, healthLogs] = await Promise.all([
    supabase.from("babies").select("*"),
    supabase.from("appointments").select("*"),
    supabase.from("health_logs").select("*"),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 2,
    babies: babies.data ?? [],
    appointments: appointments.data ?? [],
    healthLogs: healthLogs.data ?? [],
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="newborn-companion-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
