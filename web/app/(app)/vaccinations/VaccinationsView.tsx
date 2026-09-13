"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { Modal } from "../Modal";
import { saveVaccinationAction, clearVaccinationAction, type VaccinationFormState } from "@/lib/vaccinations/actions";
import { VACCINATION_SCHEDULE, type VaccinationScheduleItem } from "@/lib/content/vaccinations";
import type { VaccinationRecord } from "@/lib/data/vaccinations";
import type { Baby } from "@/lib/data/babies";
import { daysBetween, todayStr } from "@/lib/baby/age";

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function VaccinationsView({ records, baby }: { records: VaccinationRecord[]; baby: Baby }) {
  const [editing, setEditing] = useState<VaccinationScheduleItem | null>(null);
  const ageWeeks = baby.dob ? daysBetween(baby.dob, todayStr()) / 7 : 0;
  const byKey = new Map(records.map((r) => [r.schedule_key, r]));
  const given = records.filter((r) => r.given_date).length;

  return (
    <div className="card">
      <h2>Vaccinations</h2>
      <p className="small muted">
        {given} of {VACCINATION_SCHEDULE.length} recorded. Based on the NHS routine schedule — check with your health
        visitor or GP, as timing can vary.
      </p>

      {VACCINATION_SCHEDULE.map((item) => {
        const record = byKey.get(item.key);
        const isGiven = !!record?.given_date;
        const isDue = !isGiven && ageWeeks >= item.ageWeeksMin;
        return (
          <div className="list-item" key={item.key}>
            <div className="row">
              <strong>{item.ageLabel}</strong>
              {isGiven ? (
                <span className="chip" style={{ background: "var(--c-health-bg)", color: "var(--c-health-fg)" }}>
                  Given
                </span>
              ) : isDue ? (
                <span className="chip" style={{ background: "var(--danger-bg)", color: "var(--warn)" }}>
                  Due
                </span>
              ) : (
                <span className="chip muted">Not yet due</span>
              )}
            </div>
            <div className="small muted">{item.vaccines.join(", ")}</div>
            {isGiven && record?.given_date && (
              <div className="small" style={{ marginTop: 4 }}>
                Given {fmtDate(record.given_date)}
                {record.notes && ` — ${record.notes}`}
              </div>
            )}
            <div className="actions-row">
              <button className="ghost" onClick={() => setEditing(item)}>
                {isGiven ? "Edit" : "Mark as given"}
              </button>
              {record && (
                <button
                  className="ghost"
                  onClick={() => {
                    if (confirm("Clear this record?")) clearVaccinationAction(record.id);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        );
      })}

      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing && (
          <VaccinationForm item={editing} record={byKey.get(editing.key) ?? null} onDone={() => setEditing(null)} />
        )}
      </Modal>
    </div>
  );
}

function VaccinationForm({
  item,
  record,
  onDone,
}: {
  item: VaccinationScheduleItem;
  record: VaccinationRecord | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<VaccinationFormState, FormData>(saveVaccinationAction, {});
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onDone();
    wasPending.current = pending;
  }, [pending, state, onDone]);

  return (
    <form action={formAction}>
      <input type="hidden" name="schedule_key" value={item.key} />
      <div className="modal-icon" style={{ background: "var(--c-health-bg)" }}>💉</div>
      <h2>{item.ageLabel}</h2>
      <p className="small muted">{item.vaccines.join(", ")}</p>

      <label htmlFor="v_date">Date given</label>
      <input type="date" id="v_date" name="given_date" defaultValue={record?.given_date ?? todayStr()} required />

      <label htmlFor="v_notes">Notes (optional)</label>
      <textarea id="v_notes" name="notes" placeholder="Any reaction, which clinic, etc." defaultValue={record?.notes ?? ""} />

      {state.error && (
        <p className="small" style={{ color: "var(--danger)" }}>
          {state.error}
        </p>
      )}

      <div className="actions-row">
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" className="secondary" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
