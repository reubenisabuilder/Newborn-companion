"use client";

import { useActionState, useState } from "react";
import {
  createFamilyAction,
  joinFamilyAction,
  confirmFamilyCreatedAction,
  importLegacyBackupAction,
  type CreateFamilyState,
  type JoinFamilyState,
  type ImportBackupState,
} from "@/lib/family/actions";
import {
  completeOnboardingBabyAction,
  type OnboardingBabyState,
} from "@/lib/babies/actions";

type Mode = "choose" | "create" | "join";

export function JoinScreen() {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <div className="join-screen">
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 6 }}>
          Newborn Companion
        </h1>
        <p className="muted small">
          Appointments, growth, and a week-by-week guide — shared with your
          family.
        </p>
      </div>

      {mode === "choose" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => setMode("create")}>Start a new family</button>
          <button className="secondary" onClick={() => setMode("join")}>
            Join with a family code
          </button>
        </div>
      )}

      {mode === "create" && <CreateFamilyCard onBack={() => setMode("choose")} />}
      {mode === "join" && <JoinFamilyCard onBack={() => setMode("choose")} />}
    </div>
  );
}

function CreateFamilyCard({ onBack }: { onBack: () => void }) {
  const [state, formAction, pending] = useActionState<CreateFamilyState, FormData>(
    createFamilyAction,
    {}
  );
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [babyStep, setBabyStep] = useState(false);

  if (state.code && babyStep) {
    return <OnboardingBabyForm />;
  }

  if (state.code) {
    return (
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2>Save your family code</h2>
        <p className="small muted">
          Share this with anyone in the family who should have access —
          partner, grandparents, anyone helping out. Anyone with this code has
          full access. We can never show it to you again, so save it
          somewhere safe now.
        </p>
        <div className="code-display">{state.code}</div>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            navigator.clipboard.writeText(state.code!);
            setCopied(true);
          }}
        >
          {copied ? "Copied ✓" : "Copy code"}
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "row" }}>
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
          />
          <span style={{ fontWeight: 600 }}>I&apos;ve saved this code</span>
        </label>
        <ImportBackupPrompt />
        <button type="button" disabled={!saved} onClick={() => setBabyStep(true)}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h2>Start a new family</h2>
      <p className="small muted">
        We&apos;ll generate a code you can share with anyone who should have
        access.
      </p>
      {state.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create family"}
      </button>
      <button type="button" className="ghost" onClick={onBack}>
        Back
      </button>
    </form>
  );
}

function OnboardingBabyForm() {
  const [state, formAction, pending] = useActionState<OnboardingBabyState, FormData>(
    completeOnboardingBabyAction,
    {}
  );

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h2>Baby&apos;s details</h2>
      <p className="small muted">
        Just enough to get started — name and date of birth. Everything else
        (birth weight, gestation) can wait until Settings.
      </p>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label htmlFor="ob_name">Name</label>
        <input id="ob_name" name="name" placeholder="Baby's name" required autoFocus />
        <label htmlFor="ob_dob">Date of birth</label>
        <input type="date" id="ob_dob" name="dob" />
        {state.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Continue to dashboard"}
        </button>
      </form>
      <form action={confirmFamilyCreatedAction}>
        <button type="submit" className="ghost" style={{ width: "100%" }}>
          Skip for now
        </button>
      </form>
    </div>
  );
}

function ImportBackupPrompt() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ImportBackupState, FormData>(
    importLegacyBackupAction,
    {}
  );

  if (state.imported) {
    return <p className="small" style={{ color: "var(--good)" }}>Backup imported.</p>;
  }

  if (!open) {
    return (
      <button type="button" className="ghost" onClick={() => setOpen(true)}>
        Have a backup from the old app? Import it
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label htmlFor="file">Backup file (.json)</label>
      <input id="file" name="file" type="file" accept=".json" />
      {state.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
      <button type="submit" className="secondary" disabled={pending}>
        {pending ? "Importing…" : "Import"}
      </button>
    </form>
  );
}

function JoinFamilyCard({ onBack }: { onBack: () => void }) {
  const [state, formAction, pending] = useActionState<JoinFamilyState, FormData>(
    joinFamilyAction,
    {}
  );

  return (
    <form action={formAction} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h2>Join with a family code</h2>
      <label htmlFor="code">Family code</label>
      <input id="code" name="code" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autoComplete="off" />
      {state.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Joining…" : "Join family"}
      </button>
      <button type="button" className="ghost" onClick={onBack}>
        Back
      </button>
    </form>
  );
}
