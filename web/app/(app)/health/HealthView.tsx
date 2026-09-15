"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { Modal } from "../Modal";
import { WeightChart } from "./WeightChart";
import { saveHealthLogAction, deleteHealthLogAction, type HealthLogFormState } from "@/lib/health/actions";
import { HEALTH_METRICS, type HealthLog } from "@/lib/data/health";
import type { Baby } from "@/lib/data/babies";
import type { HealthLogType } from "@/lib/supabase/database.types";

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function HealthView({ healthLogs, baby }: { healthLogs: HealthLog[]; baby: Baby }) {
  const [active, setActive] = useState<HealthLogType>("weight");
  const [editing, setEditing] = useState<HealthLog | "new" | null>(null);

  const metric = HEALTH_METRICS.find((m) => m.key === active)!;
  const entries = healthLogs.filter((h) => h.type === active).sort((a, b) => a.date.localeCompare(b.date));
  const last = entries[entries.length - 1];
  const prev = entries[entries.length - 2];

  return (
    <>
      <div className="card">
        <h2>
          Data
          <button className="btn-add" onClick={() => setEditing("new")}>
            + Add
          </button>
        </h2>
        <div className="segmented">
          {HEALTH_METRICS.map((m) => (
            <button
              key={m.key}
              className={`seg-btn mode-health${m.key === active ? " active" : ""}`}
              onClick={() => setActive(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {entries.length === 0 ? (
          <div className="empty">No {metric.label.toLowerCase()} entries yet. Tap + Add to log the first one.</div>
        ) : (
          <>
            <div className="row" style={{ alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                  {last.value}
                  <span className="small muted" style={{ fontWeight: 700 }}> {last.unit || metric.unit}</span>
                </div>
                {prev && metric.key === "weight" ? (
                  <div className="small muted">
                    {parseFloat(last.value) - parseFloat(prev.value) >= 0 ? "+" : ""}
                    {(parseFloat(last.value) - parseFloat(prev.value)).toFixed(2)} kg since {fmtDate(prev.date)}
                  </div>
                ) : (
                  <div className="small muted">{fmtDate(last.date)}</div>
                )}
              </div>
            </div>
            <WeightChart entries={entries} metricKey={active} metricUnit={metric.unit} baby={baby} />
          </>
        )}
      </div>

      <div className="card">
        <h2>{metric.label} log</h2>
        {entries.length ? (
          [...entries].reverse().map((h) => (
            <div className="list-item" key={h.id}>
              <div className="row">
                <strong>
                  {h.value} {h.unit}
                </strong>
                <span className="small muted">{fmtDate(h.date)}</span>
              </div>
              {h.notes && <div className="small" style={{ marginTop: 4 }}>{h.notes}</div>}
              <div className="actions-row">
                <button className="ghost" onClick={() => setEditing(h)}>
                  Edit
                </button>
                <button
                  className="ghost"
                  onClick={() => {
                    if (confirm("Delete this entry? This can't be undone.")) deleteHealthLogAction(h.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">Nothing logged for {metric.label.toLowerCase()} yet.</div>
        )}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing && (
          <HealthLogForm
            entry={editing === "new" ? null : editing}
            presetType={active}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}

function HealthLogForm({
  entry,
  presetType,
  onDone,
}: {
  entry: HealthLog | null;
  presetType: HealthLogType;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<HealthLogFormState, FormData>(saveHealthLogAction, {});
  const wasPending = useRef(false);
  const type = entry?.type ?? presetType;
  const defaultUnit = HEALTH_METRICS.find((m) => m.key === type)?.unit ?? "";

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onDone();
    wasPending.current = pending;
  }, [pending, state, onDone]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={entry?.id ?? ""} />
      <div className="modal-icon" style={{ background: "var(--c-health-bg)" }}>
        📈
      </div>
      <h2>{entry ? "Edit" : "Add"} data entry</h2>

      <label htmlFor="h_type">Type</label>
      <select id="h_type" name="type" defaultValue={type}>
        {HEALTH_METRICS.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>

      <div className="grid2">
        <div>
          <label htmlFor="h_value">Value</label>
          <input id="h_value" name="value" defaultValue={entry?.value ?? ""} inputMode="decimal" required />
        </div>
        <div>
          <label htmlFor="h_unit">Unit</label>
          <input id="h_unit" name="unit" defaultValue={entry?.unit ?? defaultUnit} placeholder="kg, µmol/L, °C..." />
        </div>
      </div>

      <label htmlFor="h_date">Date</label>
      <input type="date" id="h_date" name="date" defaultValue={entry?.date ?? todayStr()} required />

      <label htmlFor="h_notes">Notes</label>
      <textarea
        id="h_notes"
        name="notes"
        placeholder="Context, who measured it, anything said about it..."
        defaultValue={entry?.notes ?? ""}
      />

      {state.error && <p className="small" style={{ color: "var(--danger)" }}>{state.error}</p>}

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
