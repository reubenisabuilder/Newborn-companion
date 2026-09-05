"use client";

import { useState } from "react";
import { niceTicks } from "@/lib/charts/chart-math";
import { toKg } from "@/lib/data/babies";
import type { HealthLog } from "@/lib/data/health";
import type { Baby } from "@/lib/data/babies";
import type { HealthLogType } from "@/lib/supabase/database.types";

function fmtShort(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
function fmtFull(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function WeightChart({
  entries,
  metricKey,
  metricUnit,
  baby,
}: {
  entries: HealthLog[];
  metricKey: HealthLogType;
  metricUnit: string;
  baby: Baby | null;
}) {
  const [readout, setReadout] = useState<string | null>(null);

  if (entries.length === 0) return null;

  const W = 580,
    H = 210,
    padL = 42,
    padR = 14,
    padT = 18,
    padB = 28;

  const vals = entries.map((e) => parseFloat(e.value));
  const dates = entries.map((e) => new Date(e.date + "T00:00:00").getTime());

  // The lb->kg conversion carried forward from the original app's bugfix:
  // birth weight can be entered in lb while weight entries are logged in
  // kg, so the reference line MUST convert or it silently plots on the
  // wrong scale.
  let refWeight: number | null = null;
  if (metricKey === "weight" && baby?.birth_weight != null) {
    refWeight = toKg(baby.birth_weight, baby.weight_unit);
  }

  const allVals = refWeight != null ? [...vals, refWeight] : vals;
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const pad = (max - min) * 0.15 || Math.max(max * 0.1, 1);
  const ticks = niceTicks(min - pad, max + pad, 4);
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const dMin = Math.min(...dates);
  const dMax = Math.max(...dates);

  const xOf = (d: number) =>
    dates.length > 1 && dMax > dMin ? padL + ((d - dMin) / (dMax - dMin)) * (W - padL - padR) : (W - padL - padR) / 2 + padL;
  const yOf = (v: number) => H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB);

  let band: { x1: number; x2: number } | null = null;
  if (metricKey === "weight" && baby?.dob && dates.length) {
    const dobMs = new Date(baby.dob + "T00:00:00").getTime();
    const bandStart = dobMs + 14 * 86400000;
    const bandEnd = dobMs + 21 * 86400000;
    if (bandEnd >= dMin - 3 * 86400000 && bandStart <= dMax + 3 * 86400000) {
      const x1 = Math.max(padL, xOf(Math.max(bandStart, dMin)));
      const x2 = Math.min(W - padR, xOf(Math.min(bandEnd, dMax)));
      if (x2 > x1) band = { x1, x2 };
    }
  }

  const lastI = entries.length - 1;
  const lx = xOf(dates[lastI]);
  const ly = yOf(vals[lastI]);
  const labelY = ly < padT + 16 ? ly + 16 : ly - 10;

  const linePath =
    entries.length >= 2
      ? entries.map((_, i) => `${i === 0 ? "M" : "L"}${xOf(dates[i]).toFixed(1)},${yOf(vals[i]).toFixed(1)}`).join(" ")
      : "";
  const areaPath =
    linePath &&
    `${linePath} L${xOf(dates[lastI]).toFixed(1)},${H - padB} L${xOf(dates[0]).toFixed(1)},${H - padB} Z`;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {band && (
          <>
            <rect
              x={band.x1.toFixed(1)}
              y={padT}
              width={(band.x2 - band.x1).toFixed(1)}
              height={H - padT - padB}
              fill="var(--c-health-fg)"
              opacity={0.08}
            />
            <text
              x={((band.x1 + band.x2) / 2).toFixed(1)}
              y={H - padB - 6}
              fontSize={8}
              fill="var(--c-health-fg)"
              textAnchor="middle"
              fontWeight={700}
            >
              REGAIN WINDOW
            </text>
          </>
        )}

        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={yOf(t)} y2={yOf(t)} stroke="var(--line)" strokeWidth={1} />
            <text x={padL - 8} y={yOf(t) + 3} fontSize={9} fill="var(--muted)" textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        {refWeight != null && (
          <>
            <line
              x1={padL}
              x2={W - padR}
              y1={yOf(refWeight)}
              y2={yOf(refWeight)}
              stroke="var(--muted)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <text x={W - padR} y={yOf(refWeight) - 4} fontSize={8.5} fill="var(--muted)" textAnchor="end">
              birth weight
            </text>
          </>
        )}

        {areaPath && <path d={areaPath} fill="var(--c-health-fg)" opacity={0.1} stroke="none" />}
        {linePath && (
          <path d={linePath} fill="none" stroke="var(--c-health-fg)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        )}

        {entries.map((e, i) => (
          <circle
            key={e.id}
            className="metric-point"
            cx={xOf(dates[i]).toFixed(1)}
            cy={yOf(vals[i]).toFixed(1)}
            r={14}
            fill="transparent"
            onClick={() => setReadout(`${fmtFull(e.date)}: ${e.value} ${e.unit || metricUnit}`)}
          />
        ))}
        {entries.map((e, i) => (
          <circle
            key={e.id + "-dot"}
            cx={xOf(dates[i]).toFixed(1)}
            cy={yOf(vals[i]).toFixed(1)}
            r={5}
            fill="var(--c-health-fg)"
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))}

        <text x={lx.toFixed(1)} y={labelY.toFixed(1)} fontSize={11} fontWeight={800} fill="var(--ink)" textAnchor={lx > W - 70 ? "end" : "middle"}>
          {entries[lastI].value}
        </text>
        <text x={padL} y={H - 8} fontSize={9} fill="var(--muted)" textAnchor="start">
          {fmtShort(entries[0].date)}
        </text>
        {entries.length > 1 && (
          <text x={W - padR} y={H - 8} fontSize={9} fill="var(--muted)" textAnchor="end">
            {fmtShort(entries[lastI].date)}
          </text>
        )}
      </svg>
      <div className="chart-readout">
        {readout ? readout : "Tap a point to see its value"}
      </div>
    </div>
  );
}
