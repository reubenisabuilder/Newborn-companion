import { requireFamilyContext } from "@/lib/family/session";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const { familyId, activeBaby } = await requireFamilyContext();
  return <SettingsView familyId={familyId} baby={activeBaby} />;
}
