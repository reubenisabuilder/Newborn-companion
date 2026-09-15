import { requireFamilyContext } from "@/lib/family/session";
import { listAppointments } from "@/lib/data/appointments";
import { AppointmentsView } from "./AppointmentsView";

export default async function AppointmentsPage() {
  const { supabase, activeBaby } = await requireFamilyContext();
  if (!activeBaby) {
    return (
      <div className="card">
        <h2>Appointments</h2>
        <p className="small muted">Add baby&apos;s details in Settings first.</p>
      </div>
    );
  }

  const appointments = await listAppointments(supabase, activeBaby.id);
  return <AppointmentsView appointments={appointments} />;
}
