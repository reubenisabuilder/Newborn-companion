"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { CRYING_REASONS, type CryingReason } from "@/lib/content/crying-reasons";

// Lives in Support, not Guide: "why might they be crying" is a confidence
// question ("am I doing something wrong, is this normal") — the same job
// as the rest of this tab — not a developmental fact like week-by-week.
export function CryingSection() {
  const [cry, setCry] = useState<CryingReason | null>(null);
  const [redFlags, setRedFlags] = useState(false);

  return (
    <div className="card">
      <h2>Why might they be crying?</h2>
      <p className="small muted" style={{ marginTop: -6 }}>
        Crying is communication, not a problem to eliminate. Tap a card for more.
      </p>
      <div className="cry-grid">
        {CRYING_REASONS.map((r) => (
          <button key={r.reason} className="cry-card" onClick={() => setCry(r)}>
            <span className="ic">{r.icon}</span>
            <span>{r.reason}</span>
          </button>
        ))}
      </div>
      <div className="actions-row">
        <button className="ghost" onClick={() => setRedFlags(true)}>
          See red-flag symptoms →
        </button>
      </div>

      <Modal open={cry !== null} onClose={() => setCry(null)}>
        {cry && (
          <>
            <div className="modal-icon" style={{ background: "var(--c-cry-bg)" }}>
              {cry.icon}
            </div>
            <h2>{cry.reason}</h2>
            <p>{cry.detail}</p>
            <div className="actions-row">
              <button className="secondary" onClick={() => setCry(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={redFlags} onClose={() => setRedFlags(false)}>
        <div className="modal-icon" style={{ background: "var(--c-cry-bg)" }}>
          😢
        </div>
        <h2>Why might they be crying?</h2>
        <div className="redflag">
          <h3>Get help now if...</h3>
          <p className="small">
            Baby has a fever (38°C+) and is under 3 months old, is unusually
            floppy/drowsy or hard to wake, has breathing difficulty, won&apos;t
            feed at all, has a rash that doesn&apos;t fade under a glass, or
            jaundice that&apos;s getting worse or spreading. Call <strong>111</strong>,
            or <strong>999</strong> / A&E if it feels like an emergency.
          </p>
        </div>
        <div className="cry-grid">
          {CRYING_REASONS.map((r) => (
            <button
              key={r.reason}
              className="cry-card"
              onClick={() => {
                setRedFlags(false);
                setCry(r);
              }}
            >
              <span className="ic">{r.icon}</span>
              <span>{r.reason}</span>
            </button>
          ))}
        </div>
        <div className="actions-row" style={{ marginTop: 12 }}>
          <button className="secondary" onClick={() => setRedFlags(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
