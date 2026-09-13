"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { WEEK_GUIDE, type GuideTopic } from "@/lib/content/guide";

export function GuideView({ defaultKey, isPremature }: { defaultKey: string; isPremature: boolean }) {
  const [activeKey, setActiveKey] = useState(defaultKey);
  const [topic, setTopic] = useState<GuideTopic | null>(null);

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
    </>
  );
}
