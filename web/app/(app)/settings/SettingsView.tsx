"use client";

import { useActionState, useState } from "react";
import { saveBabyDetailsAction, addBabyAction, type SaveBabyState } from "@/lib/babies/actions";
import { deleteFamilyAction, type DeleteFamilyState } from "@/lib/family/actions";
import type { Baby } from "@/lib/data/babies";

export function SettingsView({ familyId, baby }: { familyId: string; baby: Baby | null }) {
  return (
    <>
      <BabyDetailsCard baby={baby} />
      <AddBabyCard />
      <DataCard />
      {baby && <EraseFamilyCard familyId={familyId} babyName={baby.name} />}
      <div className="card small muted">
        Newborn Companion — shared with anyone holding your family code. Not
        affiliated with the NHS. Information sourced from general NHS,
        Start4Life and Lullaby Trust public guidance; always defer to your
        own midwife, health visitor and GP.
      </div>
    </>
  );
}

function BabyDetailsCard({ baby }: { baby: Baby | null }) {
  const [state, formAction, pending] = useActionState<SaveBabyState, FormData>(
    saveBabyDetailsAction,
    {}
  );

  if (!baby) {
    return (
      <div className="card">
        <h2>Baby&apos;s details</h2>
        <p className="small muted">Add a baby below to get started.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card">
      <input type="hidden" name="id" value={baby.id} />
      <h2>Baby&apos;s details</h2>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" defaultValue={baby.name} placeholder="Baby's name" />

      <label htmlFor="dob">Date of birth</label>
      <input type="date" id="dob" name="dob" defaultValue={baby.dob ?? ""} />

      <label htmlFor="birthWeight">Birth weight (optional)</label>
      <div className="grid2">
        <input
          id="birthWeight"
          name="birthWeight"
          defaultValue={baby.birth_weight ?? ""}
          inputMode="decimal"
          placeholder="e.g. 3.4"
          aria-label="Birth weight"
        />
        <select name="weightUnit" defaultValue={baby.weight_unit} aria-label="Weight unit">
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>

      <label htmlFor="gestationWeeks">Born early? Gestational age at birth, in weeks (optional)</label>
      <input
        id="gestationWeeks"
        name="gestationWeeks"
        defaultValue={baby.gestation_weeks ?? ""}
        inputMode="decimal"
        placeholder="e.g. 34 — leave blank if born at term"
      />
      <p className="small muted" style={{ marginTop: 6 }}>
        If under 37 weeks, we&apos;ll also show an adjusted age (from your due
        date) and use it for the week-by-week guide.
      </p>

      {state.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}

      <div className="actions-row">
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function AddBabyCard() {
  return (
    <form action={addBabyAction} className="card">
      <h2>Add another baby</h2>
      <p className="small muted">Twins, or an older sibling you want to track here too.</p>
      <label htmlFor="newBabyName">Name</label>
      <input id="newBabyName" name="name" placeholder="Baby's name" required />
      <div className="actions-row">
        <button type="submit">Add baby</button>
      </div>
    </form>
  );
}

function DataCard() {
  return (
    <div className="card">
      <h2>Your data</h2>
      <p className="small muted">
        Shared with anyone who has your family code. Back up regularly.
      </p>
      <div className="actions-row">
        <a href="/api/export">
          <button type="button" className="secondary">
            Export backup (.json)
          </button>
        </a>
      </div>
    </div>
  );
}

function EraseFamilyCard({ familyId, babyName }: { familyId: string; babyName: string }) {
  const [confirmText, setConfirmText] = useState("");
  const [state, formAction, pending] = useActionState<DeleteFamilyState, FormData>(
    deleteFamilyAction,
    {}
  );
  const expected = babyName || "erase";
  const matches = confirmText.trim().length > 0 && confirmText.trim() === expected;

  return (
    <div className="card">
      <h2>Erase all data</h2>
      <p className="small muted">
        This permanently deletes everything for <strong>everyone</strong>{" "}
        holding this family&apos;s code — not just this device. Export a backup
        first if you want to keep it.
      </p>
      <label htmlFor="confirmName">
        Type <strong>{expected}</strong> to confirm
      </label>
      <input
        id="confirmName"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={expected}
      />
      {state.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
      <form action={formAction}>
        <input type="hidden" name="familyId" value={familyId} />
        <div className="actions-row">
          <button type="submit" className="danger" disabled={!matches || pending}>
            {pending ? "Erasing…" : "Erase everything"}
          </button>
        </div>
      </form>
    </div>
  );
}
