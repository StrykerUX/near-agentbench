"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { fmtCost, fmtTime } from "@/lib/benchUtils";
import type { RawRun } from "@/lib/types";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG        = "#111111";
const CARD_BG   = "#1A1A1A";
const BORDER    = "#2A2A2A";
const TEXT      = "#FFFFFF";
const MUTED     = "#888888";
const MUTED2    = "#888888";
const MUTED3    = "#888888";

// Framework colors
const FW: Record<string, { main: string; blocks: [string, string] }> = {
  ironclaw: { main: "#E8A045", blocks: ["#EA580C", "#FBBF24"] },
  openclaw: { main: "#00EC97", blocks: ["#2979FF", "#00EC97"] },
  value:    { main: "#FFB800", blocks: ["#FF6B00", "#FFB800"] },
};
const fwColor  = (id: string) => FW[id]?.main ?? "#888";
const fwBlocks = (id: string): [string, string] => FW[id]?.blocks ?? ["#888", "#888"];
const fwLabel  = (id: string) => id === "ironclaw" ? "IronClaw" : id === "openclaw" ? "OpenClaw" : id;

// Traffic-light score color
const TRAFFIC_GREEN  = "#00EC97";
const TRAFFIC_ORANGE = "#E8801A";
const TRAFFIC_RED    = "#EF4444";
const trafficColor = (passRate: number) =>
  passRate >= 0.75 ? TRAFFIC_GREEN
  : passRate >= 0.45 ? TRAFFIC_ORANGE
  : TRAFFIC_RED;

// Rank-aware color: normalizes the metric across all runs and maps to traffic light
function rankColor(run: RawRun, sortKey: SortKey, allRuns: RawRun[]): string {
  if (allRuns.length === 0) return trafficColor(run.passRate);

  let getValue: (r: RawRun) => number;
  let higherIsBetter: boolean;

  if (sortKey === "score") return trafficColor(run.passRate);
  if (sortKey === "speed")  { getValue = (r) => r.wallTimeMs;  higherIsBetter = false; }
  else if (sortKey === "cost")   { getValue = (r) => r.costUsd;     higherIsBetter = false; }
  else                           { getValue = (r) => r.valueScore;  higherIsBetter = true;  }

  const values = allRuns.map(getValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return TRAFFIC_GREEN;

  const raw = getValue(run);
  const normalized = higherIsBetter
    ? (raw - min) / (max - min)
    : (max - raw) / (max - min);

  return normalized >= 0.67 ? TRAFFIC_GREEN
       : normalized >= 0.33 ? TRAFFIC_ORANGE
       : TRAFFIC_RED;
}

// Sort accent colors
const SORT_COLOR: Record<string, string> = {
  score: "#00EC97",
  speed: "#2979FF",
  cost:  "#FFB800",
  value: "#00EC97",
};


// ── Responsive styles ─────────────────────────────────────────────────────────
const RESPONSIVE = `
  @media (max-width: 1024px) {
    .sw-outer  { padding: 32px 24px 80px !important; }
    .sw-inner  { padding: 32px 28px !important; border-radius: 20px !important; }
    .sw-grid   { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 680px) {
    .sw-outer  { padding: 0 20px 60px !important; }
    .sw-inner  { padding: 24px 20px !important; border-radius: 16px !important; }
    .sw-header { margin-bottom: 28px !important; }
    .sw-title-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 14px !important;
    }
    .sw-grid   { grid-template-columns: 1fr !important; }
    /* Card layout fixes */
    .sw-card   { padding: 18px 16px 14px !important; }
    .sw-badge-row {
      flex-wrap: wrap !important;
      gap: 6px !important;
    }
    .sw-official { margin-left: 0 !important; }
    /* CTA banner */
    .sw-cta    {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center;
      padding: 20px !important;
      gap: 16px !important;
    }
    .sw-cta-btn {
      width: 100% !important;
      flex-shrink: unset !important;
      justify-content: center !important;
    }
    /* ScoreWall internal navbar */
    .sw-nav    { padding: 0 12px !important; }
    .sw-nav-inner {
      flex-wrap: wrap !important;
      height: auto !important;
      padding-top: 10px !important;
      padding-bottom: 10px !important;
      gap: 10px !important;
    }
    .sw-wordmark { flex: 0 0 auto !important; }
    .sw-sort {
      width: 100% !important;
      overflow-x: auto;
      justify-content: flex-start !important;
    }
    .sw-ver-links { display: none !important; }
  }
  /* ── Compare ── */
  .sw-card-pin {
    position: absolute; top: 10px; left: 10px;
    width: 26px; height: 26px;
    border-radius: 6px;
    border: 1px solid #888;
    background: #1C1C1C;
    color: #888;
    font-size: 16px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 2;
    transition: background 120ms, color 120ms, border-color 120ms;
    opacity: 0;
  }
  .sw-card:hover .sw-card-pin,
  .sw-card-pin.pinned { opacity: 1 !important; }
  .sw-card-pin.pinned {
    background: #FFFFFF;
    color: #111;
    border-color: #FFFFFF;
  }
  .sw-compare-tray {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 55;
    background: #161616;
    border-top: 1px solid #2A2A2A;
    transform: translateY(100%);
    transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sw-compare-tray.open { transform: translateY(0); }
  @media (max-width: 680px) {
    .sw-card-pin { opacity: 1 !important; }
    .sw-cmp-chips { width: 100% !important; }
    .sw-cmp-actions { width: 100% !important; justify-content: flex-end !important; }
    .sw-compare-tray > div { padding: 12px 16px !important; }
  }
  /* ── List view ── */
  .sw-list-row { background: transparent; }
  .sw-list-row:last-child { border-bottom: none !important; }
  @media (max-width: 680px) {
    .sw-list-col-fw, .sw-list-col-sec { display: none !important; }
  }
  /* ── Compare modal grid ── */
  .cmp-header { display: grid; grid-template-columns: 1fr 32px 1fr; gap: 10px; align-items: start; padding: 20px 24px; }
  .cmp-tbl-head { display: grid; grid-template-columns: 140px 1fr 1fr 80px; gap: 12px; padding: 10px 0; border-bottom: 1px solid #2A2A2A; margin-bottom: 4px; }
  .cmp-row { display: grid; grid-template-columns: 140px 1fr 1fr 80px; gap: 12px; padding: 13px 0; border-bottom: 1px solid #1A1A1A; align-items: center; }
  .cmp-delta { text-align: right; }
  .cmp-ab-label { display: none; font-size: 11px; }
  @media (max-width: 580px) {
    .cmp-header { grid-template-columns: 1fr !important; padding: 16px !important; }
    .cmp-vs { padding: 0 !important; text-align: left !important; opacity: 0.5; font-size: 11px !important; }
    .cmp-tbl-head { display: none !important; }
    .cmp-row {
      grid-template-columns: 1fr 1fr !important;
      grid-template-rows: auto auto !important;
      gap: 4px 8px !important;
      padding: 12px 0 !important;
    }
    .cmp-metric-label { grid-column: 1; grid-row: 1; }
    .cmp-delta        { grid-column: 2; grid-row: 1; text-align: right !important; }
    .cmp-a-val        { grid-column: 1; grid-row: 2; }
    .cmp-b-val        { grid-column: 2; grid-row: 2; }
    .cmp-ab-label     { display: inline !important; }
    .cmp-tbl-wrap     { padding: 0 16px 24px !important; }
    .cmp-topbar       { padding: 14px 16px !important; }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────
export type { RawRun } from "@/lib/types";

type SortKey = "score" | "speed" | "cost" | "value";

// ── Pixel Gauge ───────────────────────────────────────────────────────────────
const TOTAL = 14;

// Fixed spectrum: red → orange → green → blue
const SPECTRUM = [
  { t: 0.0,  r: 239, g: 68,  b: 68  }, // red
  { t: 0.5,  r: 249, g: 115, b: 22  }, // orange
  { t: 1.0,  r: 0,   g: 236, b: 151 }, // green
];

function spectrumColor(t: number): string {
  let s0 = SPECTRUM[0], s1 = SPECTRUM[SPECTRUM.length - 1];
  for (let i = 0; i < SPECTRUM.length - 1; i++) {
    if (t >= SPECTRUM[i].t && t <= SPECTRUM[i + 1].t) { s0 = SPECTRUM[i]; s1 = SPECTRUM[i + 1]; break; }
  }
  const lt = s1.t === s0.t ? 0 : (t - s0.t) / (s1.t - s0.t);
  return `rgb(${Math.round(s0.r + lt * (s1.r - s0.r))},${Math.round(s0.g + lt * (s1.g - s0.g))},${Math.round(s0.b + lt * (s1.b - s0.b))})`;
}

function PixelGauge({ percentage }: { percentage: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pct    = Math.max(0, Math.min(100, percentage));
  const filled = Math.ceil((pct / 100) * TOTAL);

  useEffect(() => {
    if (!containerRef.current) return;
    const blocks = Array.from(containerRef.current.querySelectorAll<HTMLDivElement>("[data-filled]"));
    gsap.fromTo(
      blocks,
      { scaleX: 0, transformOrigin: "0% 50%" },
      { scaleX: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.2)" }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  return (
    <div ref={containerRef} style={{ display: "flex", gap: 3, alignItems: "center", overflow: "hidden" }}>
      {Array.from({ length: TOTAL }, (_, i) => (
        <div
          key={i}
          {...(i < filled ? { "data-filled": true } : {})}
          style={{
            width: 18, height: 12, flexShrink: 0,
            backgroundColor: i < filled ? spectrumColor(i / (TOTAL - 1)) : "rgba(255,255,255,0.08)",
          }}
        />
      ))}
    </div>
  );
}

// ── Task label chip ───────────────────────────────────────────────────────────
function LabelChip({ label }: { label: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    pass:    { bg: "#0F2A1A", color: "#00EC97" },
    partial: { bg: "#2A1F08", color: "#FFB800" },
    fail:    { bg: "#2A0F0F", color: "#FF4444" },
    pending: { bg: "#0F152A", color: "#2979FF" },
  };
  const s = map[label] ?? { bg: "#1E1E1E", color: "#888" };
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 10,
      textTransform: "uppercase", letterSpacing: "0.06em",
      padding: "3px 8px",
      backgroundColor: s.bg, color: s.color,
      border: `1px solid ${s.color}55`,
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function TaskModal({ run, onClose }: { run: RawRun; onClose: () => void }) {
  const color  = trafficColor(run.passRate);
  const colors = fwBlocks(run.frameworkId);
  const sorted = [...run.tasks].sort((a, b) => b.score - a.score);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.85)" }} />

      <div
        style={{
          position: "relative", zIndex: 1,
          backgroundColor: CARD_BG,
          border: `2px solid ${color}`,
          borderTop: `4px solid ${color}`,
          width: "100%", maxWidth: 560,
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${BORDER}`,
          position: "sticky", top: 0, backgroundColor: CARD_BG, zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, backgroundColor: color }} />
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 7, color,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  {fwLabel(run.frameworkId)}
                </span>
                {/* OFFICIAL badge hidden */}
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: TEXT, letterSpacing: "-0.02em" }}>
                {run.modelName}
              </p>
              <p style={{ margin: "4px 0 0", fontFamily: "var(--font-mono)", fontSize: 9, color: MUTED2, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {run.provider} · {run.dataset}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: "none", border: `1px solid ${BORDER}`,
              padding: "4px 10px", cursor: "pointer",
              fontFamily: "var(--font-pixel)", fontSize: 6, color: MUTED2,
              letterSpacing: "0.06em",
            }}>
              ESC
            </button>
          </div>

          {/* Gauge + stats */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 20 }}>
            <div>
              <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 48, color, lineHeight: 1, letterSpacing: "0.04em", marginBottom: 6 }}>
                {(run.passRate * 100).toFixed(0)}%
              </div>
              <PixelGauge percentage={run.passRate * 100} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", flex: 1 }}>
              {[
                ["COST",  fmtCost(run.costUsd)],
                ["TIME",  fmtTime(run.wallTimeMs)],
                ["TASKS", `${run.scoreSum.toFixed(2)}/${run.totalTasks}`],
                ["AVG",   run.avgScore.toFixed(3)],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: MUTED2, letterSpacing: "0.1em" }}>{l}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ margin: "14px 0 0", fontFamily: "var(--font-mono)", fontSize: 7, color: MUTED3, letterSpacing: "0.04em" }}>
            ▶ {run.runId}
          </p>
        </div>

        {/* Tasks */}
        <div style={{ padding: "0 24px 24px" }}>
          <p style={{ margin: "16px 0 10px", fontFamily: "var(--font-pixel)", fontSize: 6, color: MUTED2, letterSpacing: "0.1em" }}>
            {run.tasks.length} TASKS
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sorted.map((t) => (
              <div key={t.taskId} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 10px",
                border: `1px solid ${BORDER}`,
                backgroundColor: "#161616",
              }}>
                <LabelChip label={t.label} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED,
                  flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {t.taskId}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, flexShrink: 0,
                  color: t.score === 1 ? "#00EC97" : t.score === 0 ? "#FF4444" : "#FFB800",
                }}>
                  {t.score.toFixed(2)}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MUTED3, flexShrink: 0, minWidth: 36, textAlign: "right" }}>
                  {fmtTime(t.wallTimeMs)}
                </span>
                {t.error && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#FF4444" }}>⏱</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Compare Modal ─────────────────────────────────────────────────────────────
function CompareModal({ a, b, onClose }: { a: RawRun; b: RawRun; onClose: () => void }) {
  const colorA = trafficColor(a.passRate);
  const colorB = trafficColor(b.passRate);

  type Metric = { label: string; aVal: string; bVal: string; rawDelta: number; fmtDelta: string; better: "higher" | "lower" };
  const metrics: Metric[] = [
    { label: "Pass Rate",   aVal: `${(a.passRate * 100).toFixed(1)}%`,        bVal: `${(b.passRate * 100).toFixed(1)}%`,        rawDelta: b.passRate - a.passRate,           fmtDelta: `${((b.passRate - a.passRate) * 100).toFixed(1)}%`,                                                                              better: "higher" },
    { label: "Avg Score",   aVal: a.avgScore.toFixed(3),                       bVal: b.avgScore.toFixed(3),                       rawDelta: b.avgScore - a.avgScore,            fmtDelta: (b.avgScore - a.avgScore).toFixed(3),                                                                                              better: "higher" },
    { label: "Cost",        aVal: fmtCost(a.costUsd),                          bVal: fmtCost(b.costUsd),                          rawDelta: a.costUsd - b.costUsd,              fmtDelta: `${b.costUsd - a.costUsd >= 0 ? "+" : ""}${fmtCost(Math.abs(b.costUsd - a.costUsd))}`,                                           better: "lower"  },
    { label: "Time",        aVal: fmtTime(a.wallTimeMs),                       bVal: fmtTime(b.wallTimeMs),                       rawDelta: a.wallTimeMs - b.wallTimeMs,        fmtDelta: `${b.wallTimeMs - a.wallTimeMs >= 0 ? "+" : "-"}${fmtTime(Math.abs(b.wallTimeMs - a.wallTimeMs))}`,                               better: "lower"  },
    { label: "Value Score", aVal: Math.round(a.valueScore).toLocaleString(),   bVal: Math.round(b.valueScore).toLocaleString(),   rawDelta: b.valueScore - a.valueScore,        fmtDelta: `${b.valueScore - a.valueScore >= 0 ? "+" : ""}${Math.round(b.valueScore - a.valueScore).toLocaleString()}`,                      better: "higher" },
  ];

  const deltaColor = (m: Metric) => {
    if (m.rawDelta > 0) return m.better === "higher" ? TRAFFIC_GREEN : TRAFFIC_RED;
    if (m.rawDelta < 0) return m.better === "higher" ? TRAFFIC_RED : TRAFFIC_GREEN;
    return MUTED;
  };

  const ModelCard = ({ run, label, color }: { run: RawRun; label: string; color: string }) => (
    <div style={{ background: "#111", border: `1px solid ${color}44`, borderTop: `2px solid ${color}`, borderRadius: 8, padding: "14px 16px", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ width: 7, height: 7, backgroundColor: "#888", borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: MUTED, letterSpacing: "0.06em" }}>
          {fwLabel(run.frameworkId)}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: MUTED2, marginLeft: "auto", letterSpacing: "0.06em" }}>
          {label}
        </span>
      </div>
      <p style={{ margin: "0 0 4px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: TEXT, lineHeight: 1.3, wordBreak: "break-word" }}>
        {run.modelName}
      </p>
      {run.provider && (
        <p style={{ margin: "0 0 12px", fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED }}>
          {run.provider}
        </p>
      )}
      <div style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 32, color, letterSpacing: "0.04em", lineHeight: 1 }}>
        {(run.passRate * 100).toFixed(0)}%
      </div>
    </div>
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.88)" }} />
      <div
        style={{ position: "relative", zIndex: 1, backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", borderRadius: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="cmp-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: TEXT }}>
            Head-to-Head
          </span>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${BORDER}`, padding: "5px 11px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 16, color: MUTED, borderRadius: 4, lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {/* Model cards */}
        <div className="cmp-header">
          <ModelCard run={a} label="BASELINE"   color={colorA} />
          <div className="cmp-vs" style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED2 }}>vs</div>
          <ModelCard run={b} label="COMPARISON" color={colorB} />
        </div>

        {/* Metrics table */}
        <div className="cmp-tbl-wrap" style={{ padding: "0 24px 28px" }}>
          {/* Header row — hidden on mobile via CSS */}
          <div className="cmp-tbl-head">
            {[["METRIC", "left"], ["BASELINE", "left"], ["COMPARISON", "left"], ["DELTA", "right"]].map(([h, align]) => (
              <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: MUTED2, letterSpacing: "0.08em", textAlign: align as "left" | "right" }}>
                {h}
              </span>
            ))}
          </div>
          {metrics.map((m) => (
            <div key={m.label} className="cmp-row">
              <span className="cmp-metric-label" style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#D4D4D4" }}>
                {m.label}
              </span>
              <span className="cmp-a-val" style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: MUTED }}>
                <span className="cmp-ab-label" style={{ color: MUTED2, marginRight: 4 }}>A</span>
                {m.aVal}
              </span>
              <span className="cmp-b-val" style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: MUTED }}>
                <span className="cmp-ab-label" style={{ color: MUTED2, marginRight: 4 }}>B</span>
                {m.bVal}
              </span>
              <span className="cmp-delta" style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: deltaColor(m) }}>
                {m.fmtDelta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Compare Tray ──────────────────────────────────────────────────────────────
function CompareTray({
  selection,
  onRemove,
  onCompare,
  onClear,
}: {
  selection: RawRun[];
  onRemove: (runId: string) => void;
  onCompare: () => void;
  onClear: () => void;
}) {
  const isOpen = selection.length > 0;
  const canCompare = selection.length === 2;

  return (
    <div className={`sw-compare-tray${isOpen ? " open" : ""}`}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Chips */}
        <div className="sw-cmp-chips" style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
          {selection.map((run) => (
            <div key={run.runId} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#222", border: `1px solid ${BORDER}`,
              borderRadius: 6, padding: "6px 10px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: fwColor(run.frameworkId), flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: TEXT, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {run.modelName}
              </span>
              <button
                onClick={() => onRemove(run.runId)}
                style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 16, lineHeight: 1, padding: "0 0 0 2px" }}
              >
                ×
              </button>
            </div>
          ))}
          {!canCompare && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED, letterSpacing: "0.04em" }}>
              {selection.length === 0 ? "" : "Select one more to compare…"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="sw-cmp-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onClear}
            style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED, letterSpacing: "0.04em" }}
          >
            Clear
          </button>
          <button
            onClick={canCompare ? onCompare : undefined}
            disabled={!canCompare}
            style={{
              background: canCompare ? "#FFFFFF" : "#2A2A2A",
              border: "none", borderRadius: 6,
              padding: "8px 20px",
              cursor: canCompare ? "pointer" : "not-allowed",
              fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
              color: canCompare ? "#111" : "#888",
              letterSpacing: "0.04em",
              transition: "opacity 120ms, background 120ms",
              opacity: canCompare ? 1 : 0.5,
            }}
            onMouseEnter={(e) => { if (canCompare) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { if (canCompare) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            Compare →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── List Header ───────────────────────────────────────────────────────────────
function ListHeader({ sortKey }: { sortKey: SortKey }) {
  const sortColor = SORT_COLOR[sortKey];
  const cols = sortKey === "speed" ? ["TIME", "SCORE", "COST", "AVG"]
             : sortKey === "cost"  ? ["COST", "SCORE", "TIME", "AVG"]
             : sortKey === "value" ? ["VALUE", "SCORE", "COST", "TIME"]
             :                       ["SCORE", "COST",  "TIME", "AVG"];
  return (
    <div style={{
      display: "flex", alignItems: "center",
      borderLeft: "4px solid transparent",
      borderBottom: "1px solid #2A2A2A",
      padding: "0 16px 0 12px", height: 36,
    }}>
      <div style={{ width: 52, flexShrink: 0, textAlign: "right", paddingRight: 16 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>RANK</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>MODEL</span>
      </div>
      <div className="sw-list-col-fw" style={{ width: 110, flexShrink: 0, paddingRight: 16 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>FW</span>
      </div>
      {cols.map((col, i) => (
        <div key={col} className={i > 0 ? "sw-list-col-sec" : ""} style={{ width: i === 0 ? 110 : 80, flexShrink: 0, paddingRight: 16 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
            color: i === 0 ? sortColor : "#888",
            borderBottom: i === 0 ? `1px solid ${sortColor}` : "none",
            paddingBottom: i === 0 ? 2 : 0,
            display: "inline-block",
          }}>
            {col}
          </span>
        </div>
      ))}
      <div style={{ width: 18, flexShrink: 0 }} />
    </div>
  );
}

// ── Score Row (List View) ─────────────────────────────────────────────────────
function ScoreRow({ run, rank, color, sortKey, valuePct, onClick, onToggleCompare, isPinned }: {
  run: RawRun; rank: number; color: string; sortKey: SortKey; valuePct: number;
  onClick: () => void; onToggleCompare: (run: RawRun) => void; isPinned: boolean;
}) {
  const fwCol = fwColor(run.frameworkId);
  const cols = sortKey === "speed" ? [
    { label: "TIME",  value: fmtTime(run.wallTimeMs),               primary: true  },
    { label: "SCORE", value: `${(run.passRate * 100).toFixed(0)}%`, primary: false },
    { label: "COST",  value: fmtCost(run.costUsd),                  primary: false },
    { label: "AVG",   value: run.avgScore.toFixed(3),               primary: false },
  ] : sortKey === "cost" ? [
    { label: "COST",  value: fmtCost(run.costUsd),                  primary: true  },
    { label: "SCORE", value: `${(run.passRate * 100).toFixed(0)}%`, primary: false },
    { label: "TIME",  value: fmtTime(run.wallTimeMs),               primary: false },
    { label: "AVG",   value: run.avgScore.toFixed(3),               primary: false },
  ] : sortKey === "value" ? [
    { label: "VALUE", value: valuePct.toFixed(2),                   primary: true  },
    { label: "SCORE", value: `${(run.passRate * 100).toFixed(0)}%`, primary: false },
    { label: "COST",  value: fmtCost(run.costUsd),                  primary: false },
    { label: "TIME",  value: fmtTime(run.wallTimeMs),               primary: false },
  ] : [
    { label: "SCORE", value: `${(run.passRate * 100).toFixed(0)}%`, primary: true  },
    { label: "COST",  value: fmtCost(run.costUsd),                  primary: false },
    { label: "TIME",  value: fmtTime(run.wallTimeMs),               primary: false },
    { label: "AVG",   value: run.avgScore.toFixed(3),               primary: false },
  ];

  return (
    <div
      onClick={onClick}
      className="sw-list-row"
      style={{
        display: "flex", alignItems: "center",
        borderLeft: `4px solid ${color}`,
        borderBottom: "1px solid #222",
        padding: "0 16px 0 12px",
        minHeight: 58, cursor: "pointer", gap: 0,
        transition: "background 120ms",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#1E1E1E"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      {/* Rank */}
      <div style={{ width: 52, flexShrink: 0, textAlign: "right", paddingRight: 16 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#888", letterSpacing: "0.04em" }}>
          #{rank}
        </span>
      </div>

      {/* Model */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: 24, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "#FFF",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {run.modelName}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", letterSpacing: "0.06em",
          textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {run.provider}{run.suite ? ` · ${run.suite}` : ""}
        </span>
      </div>

      {/* Framework */}
      <div className="sw-list-col-fw" style={{ width: 110, flexShrink: 0, display: "flex", alignItems: "center", gap: 7, paddingRight: 16 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: fwCol, flexShrink: 0, display: "inline-block" }} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#888", letterSpacing: "0.01em" }}>
          {fwLabel(run.frameworkId)}
        </span>
      </div>

      {/* Metric columns */}
      {cols.map((col, i) => (
        <div key={col.label} className={i > 0 ? "sw-list-col-sec" : ""} style={{ width: i === 0 ? 110 : 80, flexShrink: 0, paddingRight: 16 }}>
          {col.primary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color, letterSpacing: "0.02em" }}>
                {col.value}
              </span>
              {(sortKey === "score" || sortKey === "value") && (
                <div style={{ width: 72, height: 5, backgroundColor: "#2A2A2A", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${sortKey === "score" ? run.passRate * 100 : Math.min(valuePct, 100)}%`,
                    height: "100%", backgroundColor: color, borderRadius: 3,
                  }} />
                </div>
              )}
            </div>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#D4D4D4" }}>
              {col.value}
            </span>
          )}
        </div>
      ))}

      {/* Compare checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleCompare(run); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
      >
        <div style={{
          width: 18, height: 18,
          border: `2px solid ${isPinned ? color : "#888"}`,
          borderRadius: 3,
          backgroundColor: isPinned ? color : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 120ms, border-color 120ms",
        }}>
          {isPinned && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}

// ── Score Card ────────────────────────────────────────────────────────────────
function ScoreCard({ run, rank, color, sortKey, valuePct, onClick, onToggleCompare, isPinned }: {
  run: RawRun; rank: number; color: string; sortKey: SortKey; valuePct: number;
  onClick: () => void;
  onToggleCompare: (run: RawRun) => void;
  isPinned: boolean;
}) {
  const fwCol = fwColor(run.frameworkId);

  // Hero metric — changes based on active filter
  const heroValue = sortKey === "speed" ? fmtTime(run.wallTimeMs)
                  : sortKey === "cost"  ? fmtCost(run.costUsd)
                  : sortKey === "value" ? valuePct.toFixed(2)
                  : `${(run.passRate * 100).toFixed(0)}%`;
  const heroLabel = sortKey === "speed" ? "SPEED"
                  : sortKey === "cost"  ? "COST"
                  : sortKey === "value" ? "VALUE"
                  : null;

  // Stats grid — when a non-score filter is active, promote SCORE to top-left
  // and remove the active metric (since it's now the hero)
  const SCORE_STAT = { label: "SCORE", value: `${(run.passRate * 100).toFixed(0)}%` };
  const gridStats = sortKey === "speed"  ? [SCORE_STAT, { label: "COST",  value: fmtCost(run.costUsd) },        { label: "AVG",   value: run.avgScore.toFixed(3) },    { label: "TASKS", value: `${run.scoreSum.toFixed(1)}/${run.totalTasks}` }]
                  : sortKey === "cost"   ? [SCORE_STAT, { label: "TIME",  value: fmtTime(run.wallTimeMs) },     { label: "AVG",   value: run.avgScore.toFixed(3) },    { label: "TASKS", value: `${run.scoreSum.toFixed(1)}/${run.totalTasks}` }]
                  : sortKey === "value"  ? [SCORE_STAT, { label: "COST",  value: fmtCost(run.costUsd) },        { label: "TIME",  value: fmtTime(run.wallTimeMs) },    { label: "AVG",   value: run.avgScore.toFixed(3) }]
                  :                        [            { label: "COST",  value: fmtCost(run.costUsd) },        { label: "TIME",  value: fmtTime(run.wallTimeMs) },    { label: "AVG",   value: run.avgScore.toFixed(3) }, { label: "TASKS", value: `${run.scoreSum.toFixed(1)}/${run.totalTasks}` }];

  return (
    <div
      onClick={onClick}
      className="sw-card"
      style={{
        minWidth: 0,
        backgroundColor: "#1C1C1C",
        border: `2px solid ${color}`,
        borderRadius: 14,
        padding: "22px 24px 18px",
        display: "flex", flexDirection: "column", gap: 16,
        position: "relative", cursor: "pointer",
        transition: "box-shadow 200ms, transform 200ms",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `0 0 24px ${color}33`;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "none";
        el.style.transform = "none";
      }}
    >
      {/* Rank watermark */}
      <span aria-hidden style={{
        position: "absolute", top: 12, right: 20,
        fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 72, letterSpacing: "0.04em",
        color: "#FFFFFF", opacity: 0.05,
        lineHeight: 1, pointerEvents: "none", userSelect: "none",
      }}>
        #{rank}
      </span>

      {/* Top: framework badge + OFFICIAL */}
      <div className="sw-badge-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, backgroundColor: "#888", borderRadius: 2, flexShrink: 0 }} />
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
          color: "#888", letterSpacing: "0.01em",
        }}>
          {fwLabel(run.frameworkId)}
        </span>
        {/* OFFICIAL badge hidden */}
      </div>

      {/* Model name + provider chip */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 32 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19,
          color: "#FFFFFF", lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {run.modelName}
        </span>
        {run.provider && (
          <span style={{
            display: "inline-block", alignSelf: "flex-start",
            fontFamily: "var(--font-mono)", fontSize: 12, color: "#9CA3AF",
            border: "1px solid #444", borderRadius: 4,
            padding: "3px 10px",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {run.provider}
          </span>
        )}
      </div>

      {/* Hero metric */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {heroLabel && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {heroLabel}
          </span>
        )}
        <div style={{
          fontFamily: "var(--font-inter)", fontWeight: 600,
          fontSize: sortKey === "score" ? 56 : 48,
          color, lineHeight: 0.9, letterSpacing: "0.02em",
        }}>
          {heroValue}
        </div>
        {sortKey === "score" && (
          <>
            <PixelGauge percentage={run.passRate * 100} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", letterSpacing: "0.06em" }}>
              VALUE {valuePct.toFixed(2)}
            </span>
          </>
        )}
        {sortKey === "value" && <PixelGauge percentage={valuePct} />}
      </div>

      {/* Suite / dataset */}
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 12, color: "#888",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        {run.suite} · {run.dataset}
      </span>

      {/* Stats 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 12, columnGap: 16 }}>
        {gridStats.map((s) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 12, color: "#888",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#D4D4D4", fontWeight: 500 }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: run ID + DETAILS */}
      <div style={{
        borderTop: "1px solid #2A2A2A", paddingTop: 12,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color: "#888",
          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}>
          ▪ {run.runId}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color,
          fontWeight: 600, letterSpacing: "0.06em", flexShrink: 0,
        }}>
          DETAILS →
        </span>
      </div>

      {/* Add to Compare row */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleCompare(run); }}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none", cursor: "pointer", padding: 0,
          width: "100%",
        }}
      >
        {/* Checkbox */}
        <div style={{
          width: 18, height: 18, flexShrink: 0,
          border: `2px solid ${isPinned ? color : "#888"}`,
          borderRadius: 3,
          backgroundColor: isPinned ? color : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 120ms, border-color 120ms",
        }}>
          {isPinned && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14,
          color: isPinned ? color : "#D4D4D4",
          textDecoration: "underline",
          letterSpacing: "-0.01em",
          transition: "color 120ms",
        }}>
          {isPinned ? "Added" : "Add to Compare"}
        </span>
      </button>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ sortKey, onSort, viewMode, onViewMode }: {
  sortKey: SortKey; onSort: (k: SortKey) => void;
  viewMode: "grid" | "list"; onViewMode: (m: "grid" | "list") => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const SORT_OPTS: { id: SortKey; label: string }[] = [
    { id: "score", label: "SCORE" },
    { id: "speed", label: "SPEED" },
    { id: "cost",  label: "COST" },
    { id: "value", label: "VALUE" },
  ];

  return (
    <nav
      className="sw-nav"
      style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: `2px solid ${scrolled ? BORDER : "transparent"}`,
        backgroundColor: scrolled ? "rgba(17,17,17,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        padding: "0 24px",
        transition: "border-color 200ms, background-color 200ms",
      }}
    >
      <div
        className="sw-nav-inner"
        style={{ maxWidth: 1000, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 20 }}
      >
        {/* Wordmark */}
        <div className="sw-wordmark" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#00EC97", letterSpacing: "0.08em", lineHeight: 1 }}>
            AGENTBENCH
          </span>
        </div>

        {/* Sort tabs */}
        <div className="sw-sort" style={{ display: "flex", gap: 2 }}>
          {SORT_OPTS.map((o) => {
            const active = sortKey === o.id;
            const ac = SORT_COLOR[o.id];
            return (
              <button key={o.id} onClick={() => onSort(o.id)} style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                fontWeight: active ? 600 : 400,
                padding: "6px 14px", cursor: "pointer",
                border: active ? `2px solid ${ac}` : "2px solid transparent",
                backgroundColor: "transparent",
                color: active ? ac : "#888",
                letterSpacing: "0.06em",
                transition: "color 80ms step-start, border-color 80ms step-start",
                whiteSpace: "nowrap",
              }}>
                {o.label}
              </button>
            );
          })}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {(["grid", "list"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onViewMode(m)}
              title={m === "grid" ? "Grid view" : "List view"}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: `1px solid ${viewMode === m ? "#888" : "transparent"}`,
                borderRadius: 6, cursor: "pointer",
                color: viewMode === m ? "#FFF" : "#888",
                transition: "color 120ms, border-color 120ms",
              }}
            >
              {m === "grid" ? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
                  <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
                  <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
                  <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="2.5" width="13" height="2" rx="1" fill="currentColor" />
                  <rect x="1" y="6.5" width="13" height="2" rx="1" fill="currentColor" />
                  <rect x="1" y="10.5" width="13" height="2" rx="1" fill="currentColor" />
                </svg>
              )}
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScoreWall({ runs, generatedAt }: { runs: RawRun[]; generatedAt: string }) {
  const [sort, setSort]               = useState<SortKey>("score");
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid");
  const [selected, setSelected]       = useState<RawRun | null>(null);
  const [compareSelection, setCompareSelection] = useState<RawRun[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompare = (run: RawRun) => {
    setCompareSelection((prev) => {
      if (prev.some((r) => r.runId === run.runId)) return prev.filter((r) => r.runId !== run.runId);
      if (prev.length >= 2) return [prev[1], run]; // swap oldest
      return [...prev, run];
    });
  };

  const sorted = useMemo(() => [...runs].sort((a, b) =>
    sort === "speed" ? a.wallTimeMs - b.wallTimeMs
  : sort === "cost"  ? a.costUsd - b.costUsd
  : sort === "value" ? b.valueScore - a.valueScore
  : b.passRate - a.passRate
  ), [runs, sort]);

  const date = new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
  <>
    <div className="sw-outer" style={{ backgroundColor: "#000000", padding: "48px 32px 120px" }}>
      <style>{RESPONSIVE}</style>

      <div
        className="sw-inner"
        style={{
          maxWidth: 1120, margin: "0 auto",
          backgroundColor: "#181818",
          borderRadius: 28,
          padding: "48px 40px 48px",
        }}
      >

        {/* ── Section header ──────────────────────────────────────────────── */}
        <div className="sw-header" style={{ marginBottom: 48 }}>
          {/* Title row */}
          <div
            className="sw-title-row"
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}
          >
            <div>
              <h2 style={{
                margin: "0 0 10px",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(36px, 5vw, 56px)", color: "#FFFFFF",
                letterSpacing: "-0.02em", lineHeight: 1,
              }}>
                Leaderboard
              </h2>
              <p style={{
                margin: 0,
                fontFamily: "var(--font-mono)", fontSize: 11, color: "#888",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                {runs.length} RUNS · IRONCLAW × OPENCLAW · {date}
              </p>
            </div>

          </div>
        </div>

        {/* ── Navbar (sort controls) ───────────────────────────────────────── */}
        <Navbar sortKey={sort} onSort={setSort} viewMode={viewMode} onViewMode={setViewMode} />

        {/* ── Cards grid / List view ──────────────────────────────────────── */}
        {(() => {
          const values = sorted.map((r) => r.valueScore);
          const logMin = Math.log1p(Math.min(...values));
          const logMax = Math.log1p(Math.max(...values));
          const rowProps = (run: RawRun, i: number) => {
            const logVal = Math.log1p(run.valueScore);
            const pct    = logMax === logMin ? 100 : 10 + ((logVal - logMin) / (logMax - logMin)) * 90;
            return {
              run,
              rank: i + 1,
              color: rankColor(run, sort, sorted),
              sortKey: sort,
              valuePct: pct,
              onClick: () => setSelected(run),
              onToggleCompare: toggleCompare,
              isPinned: compareSelection.some((r) => r.runId === run.runId),
            };
          };

          if (viewMode === "list") {
            return (
              <div style={{ marginTop: 24, borderRadius: 10, overflow: "hidden", border: "1px solid #2A2A2A" }}>
                <ListHeader sortKey={sort} />
                {sorted.map((run, i) => <ScoreRow key={run.runId} {...rowProps(run, i)} />)}
              </div>
            );
          }

          return (
            <div
              className="sw-grid"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${sorted.length <= 4 ? 2 : sorted.length <= 9 ? 3 : 4}, 1fr)`,
                gap: 20, marginTop: 24,
              }}
            >
              {sorted.map((run, i) => <ScoreCard key={run.runId} {...rowProps(run, i)} />)}
            </div>
          );
        })()}

        {/* CTA Banner — hidden until destination is ready */}

      </div>

      {selected && <TaskModal run={selected} onClose={() => setSelected(null)} />}
    </div>

    {compareOpen && compareSelection.length === 2 && (() => {
      const [left, right] = compareSelection[0].passRate >= compareSelection[1].passRate
        ? [compareSelection[0], compareSelection[1]]
        : [compareSelection[1], compareSelection[0]];
      return (
        <CompareModal
          a={left}
          b={right}
          onClose={() => setCompareOpen(false)}
        />
      );
    })()}

    <CompareTray
      selection={compareSelection}
      onRemove={(id) => setCompareSelection((prev) => prev.filter((r) => r.runId !== id))}
      onCompare={() => setCompareOpen(true)}
      onClear={() => { setCompareSelection([]); setCompareOpen(false); }}
    />
  </>
  );
}
