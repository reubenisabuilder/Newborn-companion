import { requireFamilyContext } from "@/lib/family/session";
import { listHealthLogs } from "@/lib/data/health";
import { HealthView } from "./HealthView";

export default async function HealthPage() {
  const { supabase, activeBaby } = await requireFamilyContext();
  if (!activeBaby) {
    return (
      <div className="card">
        <h2>Data</h2>
        <p className="small muted">Add baby&apos;s details in Settings first.</p>
      </div>
    );
  }

  const healthLogs = await listHealthLogs(supabase, activeBaby.id);
  return <HealthView healthLogs={healthLogs} baby={activeBaby} />;
}
