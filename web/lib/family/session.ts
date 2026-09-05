import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getBaby, type Baby } from "@/lib/data/babies";

export interface BabySummary {
  id: string;
  name: string;
}

/**
 * Gates every page under (app)/. Redirects to /join when there's no
 * session or the session isn't a member of any family yet. Resolves the
 * "active baby" from the nc_baby_id cookie (falling back to the oldest
 * baby in the family) so pages don't each have to re-derive it.
 */
export async function requireFamilyContext() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data) redirect("/join");

  const { data: memberships } = await supabase
    .from("family_members")
    .select("family_id, joined_at")
    .order("joined_at", { ascending: true })
    .limit(1);

  if (!memberships || memberships.length === 0) redirect("/join");

  const familyId = memberships[0].family_id;

  const { data: babies } = await supabase
    .from("babies")
    .select("id, name")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  const babyList: BabySummary[] = babies ?? [];
  const cookieStore = await cookies();
  const requestedBabyId = cookieStore.get("nc_baby_id")?.value;
  const activeBabyId =
    (requestedBabyId && babyList.some((b) => b.id === requestedBabyId)
      ? requestedBabyId
      : babyList[0]?.id) ?? null;

  const activeBaby: Baby | null = activeBabyId
    ? await getBaby(supabase, activeBabyId)
    : null;

  return { supabase, familyId, babies: babyList, activeBaby };
}
