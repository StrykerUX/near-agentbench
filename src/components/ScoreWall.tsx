"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { fmtCost, fmtTime } from "@/lib/benchUtils";
import type { TaskResult } from "@/lib/benchUtils";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG        = "#111111";
const CARD_BG   = "#1A1A1A";
const BORDER    = "#2A2A2A";
const TEXT      = "#FFFFFF";
const MUTED     = "#888888";
const MUTED2    = "#444444";
const MUTED3    = "#333333";

// Framework colors
const FW: Record<string, { main: string; blocks: [string, string] }> = {
  ironclaw: { main: "#E8A045", blocks: ["#EA580C", "#FBBF24"] },
  openclaw: { main: "#00EC97", blocks: ["#2979FF", "#00EC97"] },
};
const fwColor  = (id: string) => FW[id]?.main ?? "#555";
const fwBlocks = (id: string): [string, string] => FW[id]?.blocks ?? ["#555", "#555"];
const fwLabel  = (id: string) => id === "ironclaw" ? "IronClaw" : id === "openclaw" ? "OpenClaw" : id;

// Traffic-light score color
const TRAFFIC_GREEN  = "#00EC97";
const TRAFFIC_ORANGE = "#E8801A";
const TRAFFIC_RED    = "#EF4444";
const trafficColor = (passRate: number) =>
  passRate >= 0.75 ? TRAFFIC_GREEN
  : passRate >= 0.45 ? TRAFFIC_ORANGE
  : TRAFFIC_RED;

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
    .sw-outer  { padding: 32px 16px 80px !important; }
    .sw-inner  { padding: 32px 24px !important; border-radius: 20px !important; }
  }
  @media (max-width: 680px) {
    .sw-outer  { padding: 0 0 60px !important; }
    .sw-inner  { padding: 24px 12px !important; border-radius: 0 !important; }
    .sw-header { margin-bottom: 28px !important; }
    .sw-title-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 14px !important;
    }
    /* Card layout fixes */
    .sw-card   { flex: 1 1 100% !important; padding: 18px 16px 14px !important; }
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
    border: 1px solid #444;
    background: #1C1C1C;
    color: #666;
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
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RawRun {
  runId: string; frameworkId: string;
  modelName: string; provider: string;
  suite: string; dataset: string;
  passRate: number; avgScore: number;
  costUsd: number; wallTimeMs: number;
  totalTasks: number; scoreSum: number;
  valueScore: number; isOfficial: boolean;
  tasks: TaskResult[];
}

type SortKey = "score" | "speed" | "cost" | "value";

// ── Pixel Gauge ───────────────────────────────────────────────────────────────
const TOTAL = 14;

function blockColor(index: number, colors: [string, string]): string {
  const t  = index / (TOTAL - 1);
  const c0 = parseInt(colors[0].slice(1), 16);
  const c1 = parseInt(colors[1].slice(1), 16);
  const r  = Math.round(((c0 >> 16) & 0xff) + t * (((c1 >> 16) & 0xff) - ((c0 >> 16) & 0xff)));
  const g  = Math.round(((c0 >>  8) & 0xff) + t * (((c1 >>  8) & 0xff) - ((c0 >>  8) & 0xff)));
  const b  = Math.round(((c0      ) & 0xff) + t * (((c1      ) & 0xff) - ((c0      ) & 0xff)));
  return `rgb(${r},${g},${b})`;
}

function PixelGauge({ percentage, frameworkId }: { percentage: number; frameworkId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pct    = Math.max(0, Math.min(100, percentage));
  const filled = Math.ceil((pct / 100) * TOTAL);
  const colors = fwBlocks(frameworkId);

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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div ref={containerRef} style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <div
            key={i}
            {...(i < filled ? { "data-filled": true } : {})}
            style={{
              width: 18, height: 12,
              backgroundColor: i < filled ? blockColor(i, colors) : "rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#999", letterSpacing: "0.04em" }}>
        {Math.round(pct)}%
      </span>
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
  const s = map[label] ?? { bg: "#1E1E1E", color: "#555" };
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
                {run.isOfficial && (
                  <span style={{
                    fontFamily: "var(--font-pixel)", fontSize: 5,
                    color: "#00EC97", border: "1px solid #00EC9733",
                    padding: "2px 5px", letterSpacing: "0.06em",
                  }}>
                    OFFICIAL
                  </span>
                )}
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
              <PixelGauge percentage={run.passRate * 100} frameworkId={run.frameworkId} />
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
        <div style={{ width: 7, height: 7, backgroundColor: fwColor(run.frameworkId), borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: fwColor(run.frameworkId), letterSpacing: "0.06em" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: TEXT }}>
            Head-to-Head
          </span>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${BORDER}`, padding: "5px 11px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 16, color: MUTED, borderRadius: 4, lineHeight: 1 }}>
            ✕
          </button>
        </div>

        {/* Model cards */}
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 10, alignItems: "center" }}>
          <ModelCard run={a} label="BASELINE"   color={colorA} />
          <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED2 }}>vs</div>
          <ModelCard run={b} label="COMPARISON" color={colorB} />
        </div>

        {/* Metrics table */}
        <div style={{ padding: "0 24px 28px" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 80px", gap: 12, padding: "10px 0 10px", borderBottom: `1px solid ${BORDER}`, marginBottom: 4 }}>
            {[["METRIC", "left"], ["BASELINE", "left"], ["COMPARISON", "left"], ["DELTA", "right"]].map(([h, align]) => (
              <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: MUTED2, letterSpacing: "0.08em", textAlign: align as "left" | "right" }}>
                {h}
              </span>
            ))}
          </div>
          {metrics.map((m) => (
            <div key={m.label} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 80px", gap: 12, padding: "13px 0", borderBottom: `1px solid #1A1A1A`, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14, color: "#D4D4D4" }}>
                {m.label}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: MUTED }}>
                {m.aVal}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: MUTED }}>
                {m.bVal}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: deltaColor(m), textAlign: "right" }}>
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
        <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
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
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED2, letterSpacing: "0.04em" }}>
              {selection.length === 0 ? "" : "Select one more to compare…"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onClear}
            style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED, letterSpacing: "0.04em" }}
          >
            Clear
          </button>
          {canCompare && (
            <button
              onClick={onCompare}
              style={{
                background: "#FFFFFF", border: "none", borderRadius: 6,
                padding: "8px 20px", cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                color: "#111", letterSpacing: "0.04em",
                transition: "opacity 120ms",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            >
              Compare →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Score Card ────────────────────────────────────────────────────────────────
function ScoreCard({ run, rank, onClick, onToggleCompare, isPinned }: {
  run: RawRun; rank: number; sortKey: SortKey;
  onClick: () => void;
  onToggleCompare: (run: RawRun) => void;
  isPinned: boolean;
}) {
  const fwCol  = fwColor(run.frameworkId);
  const color  = trafficColor(run.passRate);

  return (
    <div
      onClick={onClick}
      className="sw-card"
      style={{
        flex: "1 1 320px",
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
        <div style={{ width: 12, height: 12, backgroundColor: fwCol, borderRadius: 2, flexShrink: 0 }} />
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
          color: fwCol, letterSpacing: "0.01em",
        }}>
          {fwLabel(run.frameworkId)}
        </span>
        {run.isOfficial && (
          <span className="sw-official" style={{
            fontFamily: "var(--font-mono)", fontSize: 12, color: "#00EC97",
            border: "1px solid #00EC97", padding: "2px 7px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            marginLeft: "auto",
          }}>OFFICIAL</span>
        )}
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

      {/* Hero score */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{
          fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 56,
          color, lineHeight: 0.9, letterSpacing: "0.04em",
        }}>
          {(run.passRate * 100).toFixed(0)}%
        </div>
        <PixelGauge percentage={run.passRate * 100} frameworkId={run.frameworkId} />
      </div>

      {/* Suite / dataset */}
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 12, color: "#777",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        {run.suite} · {run.dataset}
      </span>

      {/* Stats 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 12, columnGap: 16 }}>
        {[
          { label: "COST",  value: fmtCost(run.costUsd) },
          { label: "TIME",  value: fmtTime(run.wallTimeMs) },
          { label: "AVG",   value: run.avgScore.toFixed(3) },
          { label: "TASKS", value: `${run.scoreSum.toFixed(1)}/${run.totalTasks}` },
        ].map((s) => (
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

      {/* Footer: run ID + COMPARE + DETAILS */}
      <div style={{
        borderTop: "1px solid #2A2A2A", paddingTop: 12,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color: "#666",
          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}>
          ▪ {run.runId}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(run); }}
          style={{
            background: "none", border: `1px solid ${isPinned ? color : "#666"}`,
            borderRadius: 4, padding: "3px 10px", cursor: "pointer", flexShrink: 0,
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: isPinned ? color : "#B0B8C8",
            fontWeight: 600, letterSpacing: "0.06em",
            transition: "border-color 120ms, color 120ms",
          }}
        >
          {isPinned ? "ADDED ✓" : "COMPARE"}
        </button>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color,
          fontWeight: 600, letterSpacing: "0.06em", flexShrink: 0,
        }}>
          DETAILS →
        </span>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ sortKey, onSort }: { sortKey: SortKey; onSort: (k: SortKey) => void }) {
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
          <span style={{ fontFamily: "var(--font-condensed)", fontSize: 18, color: TEXT, letterSpacing: "0.02em", lineHeight: 1 }}>
            NEAR
          </span>
          <div style={{ width: 4, height: 4, backgroundColor: "#00EC97" }} />
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

      </div>
    </nav>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScoreWall({ runs, generatedAt }: { runs: RawRun[]; generatedAt: string }) {
  const [sort, setSort]               = useState<SortKey>("score");
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
                fontFamily: "var(--font-mono)", fontSize: 11, color: "#555",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                {runs.length} RUNS · IRONCLAW × OPENCLAW · {date}
              </p>
            </div>

            {/* View all button */}
            <a
              href="#leaderboard"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0,
                fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 14,
                color: "#00EC97", border: "1px solid #00EC97",
                borderRadius: 8, padding: "10px 20px",
                textDecoration: "none", letterSpacing: "0.01em",
                transition: "background-color 150ms",
                marginTop: 4,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#00EC9715"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}
            >
              View all leaderboard <span style={{ fontSize: 16 }}>→</span>
            </a>
          </div>
        </div>

        {/* ── Navbar (sort controls) ───────────────────────────────────────── */}
        <Navbar sortKey={sort} onSort={setSort} />

        {/* ── Cards grid ──────────────────────────────────────────────────── */}
        <div
          className="sw-grid"
          style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24 }}
        >
          {sorted.map((run, i) => (
            <ScoreCard
              key={run.runId}
              run={run}
              rank={i + 1}
              sortKey={sort}
              onClick={() => setSelected(run)}
              onToggleCompare={toggleCompare}
              isPinned={compareSelection.some((r) => r.runId === run.runId)}
            />
          ))}
        </div>

        {/* ── CTA Banner ──────────────────────────────────────────────────── */}
        <div
          className="sw-cta"
          style={{
            marginTop: 40,
            backgroundColor: "#1E1E1E",
            borderRadius: 14,
            padding: "28px 36px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Trophy emoji */}
          <div style={{ fontSize: 64, lineHeight: 1, flexShrink: 0, userSelect: "none" }}>
            🏆
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <p style={{
              margin: "0 0 6px",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20,
              color: "#FFFFFF", lineHeight: 1.2,
            }}>
              Ready to benchmark your agent?
            </p>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 14,
              color: "#777777", lineHeight: 1.5,
            }}>
              Join the community of builders pushing the boundaries of AI agents.
            </p>
          </div>

          {/* CTA Button */}
          <a
            href="#get-started"
            className="sw-cta-btn"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0,
              backgroundColor: "#C96A1A",
              color: "#FFFFFF",
              fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16,
              padding: "16px 36px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              transition: "opacity 150ms",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
          >
            Get Started <span style={{ fontSize: 18 }}>→</span>
          </a>
        </div>

      </div>

      {selected && <TaskModal run={selected} onClose={() => setSelected(null)} />}
    </div>

    {compareOpen && compareSelection.length === 2 && (
      <CompareModal
        a={compareSelection[0]}
        b={compareSelection[1]}
        onClose={() => setCompareOpen(false)}
      />
    )}

    <CompareTray
      selection={compareSelection}
      onRemove={(id) => setCompareSelection((prev) => prev.filter((r) => r.runId !== id))}
      onCompare={() => setCompareOpen(true)}
      onClear={() => { setCompareSelection([]); setCompareOpen(false); }}
    />
  </>
  );
}
