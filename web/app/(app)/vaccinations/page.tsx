import { requireFamilyContext } from "@/lib/family/session";
import { listVaccinationRecords } from "@/lib/data/vaccinations";
import { VaccinationsView } from "./VaccinationsView";

export default async function VaccinationsPage() {
  const { supabase, activeBaby } = await requireFamilyContext();
  if (!activeBaby || !activeBaby.dob) {
    return (
      <div className="card">
        <h2>Vaccinations</h2>
        <p className="small muted">Add baby&apos;s date of birth in Settings first — the schedule is worked out from their age.</p>
      </div>
    );
  }

  const records = await listVaccinationRecords(supabase, activeBaby.id);
  return <VaccinationsView records={records} baby={activeBaby} />;
}
