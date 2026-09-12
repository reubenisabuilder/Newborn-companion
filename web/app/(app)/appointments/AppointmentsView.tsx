"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { Modal } from "../Modal";
import {
  saveAppointmentAction,
  deleteAppointmentAction,
  type AppointmentFormState,
} from "@/lib/appointments/actions";
import { APPOINTMENT_TYPES, isStandaloneNote, type Appointment } from "@/lib/data/appointments";

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

export function AppointmentsView({ appointments }: { appointments: Appointment[] }) {
  const [editing, setEditing] = useState<Appointment | "new" | null>(null);
  const today = todayStr();
  const upcoming = appointments.filter((a) => a.date >= today);
  const past = [...appointments.filter((a) => a.date < today)].reverse();

  return (
    <div className="card">
      <h2>
        Appointments
        <button className="btn-add" onClick={() => setEditing("new")}>
          + Add
        </button>
      </h2>
      <h3 className="muted" style={{ marginTop: 14 }}>
        Upcoming
      </h3>
      {upcoming.length ? (
        upcoming.map((a) => (
          <AppointmentItem key={a.id} appointment={a} onEdit={() => setEditing(a)} />
        ))
      ) : (
        <div className="empty">Nothing upcoming.</div>
      )}
      {past.length > 0 && (
        <>
          <h3 className="muted" style={{ marginTop: 16 }}>
            Past
          </h3>
          {past.map((a) => (
            <AppointmentItem key={a.id} appointment={a} onEdit={() => setEditing(a)} />
          ))}
        </>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing && <AppointmentForm appointment={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function AppointmentItem({
  appointment: a,
  onEdit,
}: {
  appointment: Appointment;
  onEdit: () => void;
}) {
  return (
    <div className="list-item">
      <div className="row">
        <strong>{a.title || a.type}</strong>
        <span className={`chip type-${a.type.replace(/\s/g, "-")}`}>{a.type}</span>
      </div>
      <div className="small muted">
        {fmtDate(a.date)}
        {a.time ? " · " + a.time : ""}
      </div>
      {a.notes && (
        <div className="small" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
          {a.notes}
        </div>
      )}
      <div className="actions-row">
        <button className="ghost" onClick={onEdit}>
          Edit
        </button>
        <button
          className="ghost"
          onClick={() => {
            if (confirm("Delete this appointment? This can't be undone.")) {
              deleteAppointmentAction(a.id);
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function AppointmentForm({
  appointment,
  onDone,
}: {
  appointment: Appointment | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<AppointmentFormState, FormData>(
    saveAppointmentAction,
    {}
  );
  const [type, setType] = useState(appointment?.type ?? "Midwife");
  const isNote = isStandaloneNote(type);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onDone();
    wasPending.current = pending;
  }, [pending, state, onDone]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={appointment?.id ?? ""} />
      <div className="modal-icon" style={{ background: isNote ? "var(--c-guide-bg)" : "var(--c-appt-bg)" }}>
        {isNote ? "📝" : "📅"}
      </div>
      <h2>{appointment ? "Edit" : "Add"} {isNote ? "note" : "appointment"}</h2>

      <label htmlFor="a_type">Type</label>
      <select id="a_type" name="type" value={type} onChange={(e) => setType(e.target.value)}>
        {APPOINTMENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {isNote ? (
        <>
          <label htmlFor="a_date">Date</label>
          <input type="date" id="a_date" name="date" defaultValue={appointment?.date ?? todayStr()} required />
        </>
      ) : (
        <div className="grid2">
          <div>
            <label htmlFor="a_date">Date</label>
            <input type="date" id="a_date" name="date" defaultValue={appointment?.date ?? todayStr()} required />
          </div>
          <div>
            <label htmlFor="a_time">Time (optional)</label>
            <input type="time" id="a_time" name="time" defaultValue={appointment?.time ?? ""} />
          </div>
        </div>
      )}

      <label htmlFor="a_title">{isNote ? "What's this about?" : "Title (optional)"}</label>
      <input
        id="a_title"
        name="title"
        placeholder={isNote ? "e.g. Left hip, Feet, Feeding" : "e.g. Day 5 weight check"}
        defaultValue={appointment?.title ?? ""}
      />

      <label htmlFor="a_notes">{isNote ? "What did you notice?" : "What was said / notes"}</label>
      <textarea
        id="a_notes"
        name="notes"
        placeholder={
          isNote
            ? "What you noticed, so you can bring it up next time or remember what happened..."
            : "Key points from the appointment, any advice given, follow-ups..."
        }
        defaultValue={appointment?.notes ?? ""}
      />

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
