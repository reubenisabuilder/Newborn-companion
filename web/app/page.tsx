import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data) {
    const { data: memberships } = await supabase
      .from("family_members")
      .select("family_id")
      .limit(1);
    if (memberships && memberships.length > 0) redirect("/dashboard");
  }

  redirect("/join");
}
