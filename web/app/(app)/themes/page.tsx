import Link from "next/link";
import { requireFamilyContext } from "@/lib/family/session";
import { listAppointments, themeCounts } from "@/lib/data/appointments";

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default async function ThemesPage() {
  const { supabase, activeBaby } = await requireFamilyContext();
  if (!activeBaby) {
    return (
      <div className="card">
        <h2>Themes</h2>
        <p className="small muted">Add baby&apos;s details in Settings first.</p>
      </div>
    );
  }

  const appointments = await listAppointments(supabase, activeBaby.id);
  const themes = themeCounts(appointments);

  return (
    <div className="card">
      <h2>Themes</h2>
      <p className="small muted">
        How often something specific has come up, across appointments and notes — from the tags you&apos;ve added.
      </p>
      {themes.length === 0 ? (
        <div className="empty">
          No tags yet — add one when saving an appointment or note (e.g. &quot;hip&quot;, &quot;feeding&quot;) to start
          tracking how often it comes up.
        </div>
      ) : (
        themes.map((t) => (
          <div className="list-item" key={t.tag}>
            <div className="row">
              <strong>{t.tag}</strong>
              <span className="chip bucket-other">
                {t.count} time{t.count === 1 ? "" : "s"}
              </span>
            </div>
            {t.appointments.map((a) => (
              <Link key={a.id} href="/appointments" className="small" style={{ display: "block", marginTop: 4 }}>
                {fmtDate(a.date)} — {a.title || a.type}
              </Link>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
