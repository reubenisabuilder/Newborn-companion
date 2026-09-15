import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JoinScreen } from "./JoinScreen";

export default async function JoinPage() {
  // If this device is already signed in and already belongs to a family,
  // there's nothing to do here.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data) {
    const { data: memberships } = await supabase
      .from("family_members")
      .select("family_id")
      .limit(1);
    if (memberships && memberships.length > 0) redirect("/dashboard");
  }

  return <JoinScreen />;
}
