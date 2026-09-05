import Link from "next/link";
import { requireFamilyContext } from "@/lib/family/session";
import { listAppointments } from "@/lib/data/appointments";
import { listHealthLogs } from "@/lib/data/health";
import { buildActivityFeed } from "@/lib/dashboard/activity";
import { currentWeekIdx, daysBetween, todayStr } from "@/lib/baby/age";
import { WEEK_GUIDE } from "@/lib/content/guide";

function fmtShort(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const { supabase, activeBaby } = await requireFamilyContext();

  if (!activeBaby || !activeBaby.dob) {
    return (
      <div className="card">
        <h2>Welcome 👋</h2>
        <p className="small">
          Add baby&apos;s name and date of birth to get a running age, this week&apos;s
          guidance, and to start logging appointments and health checks.
        </p>
        <Link href="/settings">
          <button>Set up baby&apos;s details</button>
        </Link>
      </div>
    );
  }

  const [appointments, healthLogs] = await Promise.all([
    listAppointments(supabase, activeBaby.id),
    listHealthLogs(supabase, activeBaby.id),
  ]);

  const today = todayStr();
  const days = daysBetween(activeBaby.dob, today);
  const upcoming = appointments.filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const weights = healthLogs.filter((h) => h.type === "weight").sort((a, b) => a.date.localeCompare(b.date));
  const lastWeight = weights[weights.length - 1];
  const week = WEEK_GUIDE[currentWeekIdx(activeBaby)];
  const activity = buildActivityFeed(appointments, healthLogs, 6);

  return (
    <>
      <div className="card">
        <div className="hero-age">Day {Math.max(days, 0)}</div>
        <div className="hero-sub">
          {week.range} — {week.tag}
        </div>
      </div>

      <div className="qa-grid">
        <Link href="/health" className="qa-btn">
          <span className="ic">📈</span>
          <span className="t">Log weight</span>
        </Link>
        <Link href="/appointments" className="qa-btn">
          <span className="ic">📅</span>
          <span className="t">Add appt</span>
        </Link>
        <Link href="/guide" className="qa-btn">
          <span className="ic">😢</span>
          <span className="t">Why crying?</span>
        </Link>
      </div>

      <div className="stat-grid">
        <Link href="/appointments" className="stat-tile">
          <div className="label">Next appointment</div>
          {upcoming ? (
            <>
              <div className="value">{fmtShort(upcoming.date)}</div>
              <div className="sub">{upcoming.type}</div>
            </>
          ) : (
            <>
              <div className="value">—</div>
              <div className="sub">Nothing booked</div>
            </>
          )}
        </Link>
        <Link href="/health" className="stat-tile">
          <div className="label">Last weight</div>
          {lastWeight ? (
            <>
              <div className="value">
                {lastWeight.value} {lastWeight.unit}
              </div>
              <div className="sub">{fmtShort(lastWeight.date)}</div>
            </>
          ) : (
            <>
              <div className="value">—</div>
              <div className="sub">Log a weigh-in</div>
            </>
          )}
        </Link>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Recent activity</h2>
        {activity.length ? (
          activity.map((a) => (
            <Link key={a.id} href={a.href} className="activity-item">
              <div className="activity-ic" style={{ background: a.bg }}>
                {a.icon}
              </div>
              <div className="activity-body">
                <div className="activity-title">{a.title}</div>
                <div className="activity-sub">{a.sub}</div>
              </div>
              <div className="activity-date">{fmtShort(a.date)}</div>
            </Link>
          ))
        ) : (
          <div className="empty">Nothing logged yet — add an appointment or a weight check to get started.</div>
        )}
      </div>

      <div className="card">
        <h2>This week</h2>
        <div className="topic-grid">
          {week.topics.slice(0, 4).map((t) => (
            <div className="topic-card" key={t.title}>
              <span className="ic">{t.icon}</span>
              <span className="t">{t.title}</span>
              <span className="teaser">{t.teaser}</span>
            </div>
          ))}
        </div>
        <div className="actions-row">
          <Link href="/guide" className="ghost">
            See full week-by-week guide →
          </Link>
        </div>
      </div>

      <Link href="/support" className="qa-btn" style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
        <span className="ic">💛</span>
        <span className="t">Not coping today? Find support →</span>
      </Link>
    </>
  );
}
