import { requireFamilyContext } from "@/lib/family/session";
import { currentWeekIdx } from "@/lib/baby/age";
import { WEEK_GUIDE } from "@/lib/content/guide";
import { GuideView } from "./GuideView";

export default async function GuidePage() {
  const { activeBaby } = await requireFamilyContext();
  const defaultKey = WEEK_GUIDE[currentWeekIdx(activeBaby)].key;
  const isPremature = !!(
    activeBaby?.gestation_weeks && activeBaby.gestation_weeks > 0 && activeBaby.gestation_weeks < 37
  );

  return <GuideView defaultKey={defaultKey} isPremature={isPremature} />;
}
