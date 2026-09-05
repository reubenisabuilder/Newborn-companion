"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";

interface SearchItem {
  id: string;
  date: string;
  icon: string;
  title: string;
  sub: string;
  text: string;
  href: string;
}

interface RawAppointment {
  id: string;
  type: string;
  date: string;
  title: string;
  notes: string;
}
interface RawHealthLog {
  id: string;
  type: string;
  value: string;
  unit: string;
  date: string;
  notes: string;
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!open || items !== null) return;
    fetch("/api/search-index")
      .then((r) => r.json())
      .then((data: { appointments: RawAppointment[]; healthLogs: RawHealthLog[] }) => {
        const built: SearchItem[] = [];
        data.appointments.forEach((a) =>
          built.push({
            id: a.id,
            date: a.date,
            icon: "📅",
            title: a.title || a.type,
            sub: a.notes || `${a.type} appointment`,
            text: [a.type, a.title, a.notes, a.date].join(" ").toLowerCase(),
            href: "/appointments",
          })
        );
        data.healthLogs.forEach((h) =>
          built.push({
            id: h.id,
            date: h.date,
            icon: "📈",
            title: `${h.type[0].toUpperCase() + h.type.slice(1)}: ${h.value}${h.unit ? " " + h.unit : ""}`,
            sub: h.notes || "",
            text: [h.type, h.value, h.unit, h.notes, h.date].join(" ").toLowerCase(),
            href: "/health",
          })
        );
        built.sort((a, b) => b.date.localeCompare(a.date));
        setItems(built);
      });
  }, [open, items]);

  const matches = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return q ? items.filter((it) => it.text.includes(q)) : items.slice(0, 8);
  }, [items, query]);

  return (
    <>
      <button className="icon-btn" aria-label="Search" onClick={() => setOpen(true)}>
        🔍
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="modal-icon" style={{ background: "var(--accent-soft)" }}>
          🔍
        </div>
        <h2>Search everything</h2>
        <input
          className="search-input"
          aria-label="Search everything"
          placeholder="Try 'midwife', 'jaundice', a date, a name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div style={{ marginTop: 10 }}>
          {!items ? (
            <div className="empty">Loading…</div>
          ) : items.length === 0 ? (
            <div className="empty">
              Nothing logged yet — appointments, weights and check-ins you add will show up here.
            </div>
          ) : matches.length === 0 ? (
            <div className="empty">No matches for &quot;{query}&quot;.</div>
          ) : (
            <>
              {!query && <div className="small muted" style={{ marginBottom: 6 }}>Recent</div>}
              {matches.map((m) => (
                <button
                  key={m.id}
                  className="search-result"
                  onClick={() => {
                    setOpen(false);
                    router.push(m.href);
                  }}
                >
                  <div className="title">
                    {m.icon} {m.title}
                  </div>
                  <div className="snippet">
                    {fmtDate(m.date)}
                    {m.sub ? " · " + m.sub : ""}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
