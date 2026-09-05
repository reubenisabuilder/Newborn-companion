"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { WEEK_GUIDE, type GuideTopic } from "@/lib/content/guide";
import { CRYING_REASONS, type CryingReason } from "@/lib/content/crying-reasons";

export function GuideView({ defaultKey, isPremature }: { defaultKey: string; isPremature: boolean }) {
  const [activeKey, setActiveKey] = useState(defaultKey);
  const [topic, setTopic] = useState<GuideTopic | null>(null);
  const [cry, setCry] = useState<CryingReason | null>(null);
  const [redFlags, setRedFlags] = useState(false);

  const week = WEEK_GUIDE.find((w) => w.key === activeKey) ?? WEEK_GUIDE[0];

  return (
    <>
      <div className="card">
        <h2>Week by week</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          General patterns, not a prediction for your baby specifically.
          {isPremature
            ? " Showing adjusted age (from your due date), since that tracks development better for babies born early."
            : ""}
        </p>
        <div className="segmented">
          {WEEK_GUIDE.map((w) => (
            <button
              key={w.key}
              className={`seg-btn mode-guide${w.key === activeKey ? " active" : ""}`}
              onClick={() => setActiveKey(w.key)}
            >
              {w.chip}
            </button>
          ))}
        </div>
        <h3 style={{ marginBottom: 2 }}>{week.range}</h3>
        <div className="small muted" style={{ marginBottom: 12 }}>
          {week.tag}
        </div>
        <div className="topic-grid">
          {week.topics.map((t) => (
            <button key={t.title} className="topic-card" onClick={() => setTopic(t)}>
              <span className="ic">{t.icon}</span>
              <span className="t">{t.title}</span>
              <span className="teaser">{t.teaser}</span>
            </button>
          ))}
        </div>
      </div>

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
      </div>

      <Modal open={topic !== null} onClose={() => setTopic(null)}>
        {topic && (
          <>
            <div className="modal-icon" style={{ background: "var(--c-guide-bg)" }}>
              {topic.icon}
            </div>
            <h2>
              {topic.title} —{" "}
              <span className="muted" style={{ fontWeight: 600, fontSize: "0.85em" }}>
                {week.range}
              </span>
            </h2>
            <p>{topic.text}</p>
            <p className="small muted">Source: {topic.source.org}</p>
            <div className="actions-row">
              <button className="secondary" onClick={() => setTopic(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

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
    </>
  );
}
