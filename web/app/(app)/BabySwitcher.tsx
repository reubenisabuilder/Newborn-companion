"use client";

import { useTransition } from "react";
import { setActiveBabyAction } from "@/lib/babies/actions";
import type { BabySummary } from "@/lib/family/session";

export function BabySwitcher({
  babies,
  activeId,
}: {
  babies: BabySummary[];
  activeId: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Switch baby"
      value={activeId ?? ""}
      disabled={pending}
      onChange={(e) => startTransition(() => setActiveBabyAction(e.target.value))}
      style={{ width: "auto", padding: "8px 10px", fontSize: "0.82rem" }}
    >
      {babies.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name || "Baby"}
        </option>
      ))}
    </select>
  );
}
