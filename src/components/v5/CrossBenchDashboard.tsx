"use client";

import { useState, useMemo } from "react";

// ── Paleta Blueprint ──────────────────────────────────────────────────────────
const C = {
  pageBg:    "#EEF2FF",
  cardBg:    "#FFFFFF",
  cardBrd:   "#E0E7FF",
  navBg:     "#FFFFFF",
  navBrd:    "#E8ECFF",
  iron:      "#EA580C",
  open:      "#059669",
  ironPanel: "#FFF7ED",
  openPanel: "#F0FDF4",
  ironBrd:   "#FED7AA",
  openBrd:   "#A7F3D0",
  text:      "#111827",
  muted:     "#6B7280",
  track:     "#E5E7EB",
  accent:    "#4F46E5",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RunInfo {
  runId: string;
  passRate: number;
  avgScore: number;
  costUsd: number;
  wallTimeMs: number;
  totalTasks: number;
  scoreSum: number;
  valueScore: number;
  suite: string;
  isOfficial: boolean;
}

export interface ModelCrossBench {
  normalKey: string;
  displayName: string;
  provider: string;
  ironclaw?: RunInfo;
  openclaw?: RunInfo;
}

type SortKey = "passrate" | "speed" | "cost" | "value";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCost(usd: number) { return `$${usd.toFixed(4)}`; }
function fmtTime(ms: number) {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}
function best<T extends number>(a: T | undefined, b: T | undefined, compare: (x: T, y: T) => number): T | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return compare(a, b) <= 0 ? a : b;
}

function sortValue(m: ModelCrossBench, key: SortKey): number {
  const iron = m.ironclaw;
  const open = m.openclaw;
  switch (key) {
    case "passrate": return Math.max(iron?.passRate ?? -1, open?.passRate ?? -1);
    case "speed":    return -(best(iron?.wallTimeMs, open?.wallTimeMs, (a, b) => a - b) ?? Infinity);
    case "cost":     return -(best(iron?.costUsd, open?.costUsd, (a, b) => a - b) ?? Infinity);
    case "value":    return Math.max(iron?.valueScore ?? -1, open?.valueScore ?? -1);
  }
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ position: "relative", height: 8, borderRadius: 999, backgroundColor: C.track, overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: `${Math.min(value * 100, 100)}%`,
        borderRadius: 999,
        backgroundColor: color,
        transition: "width 500ms ease",
      }} />
    </div>
  );
}

// ── Framework panel ───────────────────────────────────────────────────────────

function FrameworkPanel({
  frameworkId, run, isMain,
}: {
  frameworkId: "ironclaw" | "openclaw";
  run?: RunInfo;
  isMain: boolean;
}) {
  const isIron = frameworkId === "ironclaw";
  const color  = isIron ? C.iron : C.open;
  const panelBg = isIron ? C.ironPanel : C.openPanel;
  const panelBrd = isIron ? C.ironBrd : C.openBrd;
  const label  = isIron ? "IronClaw" : "OpenClaw";

  return (
    <div style={{
      flex: 1,
      backgroundColor: run ? panelBg : "#FAFAFA",
      border: `1px solid ${run ? panelBrd : "#F0F0F0"}`,
      borderRadius: 10,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      minWidth: 0,
    }}>
      {/* Framework badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: run ? color : C.track,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
          color: run ? color : C.muted,
          letterSpacing: "-0.01em",
        }}>
          {label}
        </span>
        {run?.isOfficial && (
          <span style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: color, border: `1px solid ${color}`,
            borderRadius: 4, padding: "1px 5px",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            official
          </span>
        )}
      </div>

      {run ? (
        <>
          {/* Score + bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 26,
                color: isMain ? color : C.text,
                letterSpacing: "-0.02em",
              }}>
                {(run.passRate * 100).toFixed(0)}%
              </span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10, color: C.muted,
              }}>
                pass rate
              </span>
            </div>
            <ProgressBar value={run.passRate} color={color} />
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
            {[
              ["Cost",   fmtCost(run.costUsd)],
              ["Time",   fmtTime(run.wallTimeMs)],
              ["Tasks",  `${run.scoreSum.toFixed(2)}/${run.totalTasks}`],
              ["Avg",    run.avgScore.toFixed(3)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {label}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: C.text, fontWeight: 500 }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Suite chip */}
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: C.muted,
            letterSpacing: "0.04em",
          }}>
            suite: {run.suite}
          </span>
        </>
      ) : (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 80,
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#D1D5DB" }}>—</span>
        </div>
      )}
    </div>
  );
}

// ── Model card ────────────────────────────────────────────────────────────────

function ModelCard({ model, rank }: { model: ModelCrossBench; rank: number }) {
  const isMain = (model.ironclaw?.passRate ?? 0) > (model.openclaw?.passRate ?? 0) ? "ironclaw" : "openclaw";

  return (
    <div style={{
      backgroundColor: C.cardBg,
      border: `1px solid ${C.cardBrd}`,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(79,70,229,0.06)",
    }}>
      {/* Card header */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: `1px solid ${C.cardBrd}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: C.accent,
            fontWeight: 700, marginRight: 4,
          }}>
            #{rank}
          </span>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17,
            color: C.text, letterSpacing: "-0.02em",
          }}>
            {model.displayName}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: C.muted,
          }}>
            {model.provider}
          </span>
        </div>

        {/* Delta badge if both runs exist */}
        {model.ironclaw && model.openclaw && (() => {
          const delta = ((model.openclaw.passRate - model.ironclaw.passRate) * 100);
          const pos = delta >= 0;
          return (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: pos ? C.open : C.iron,
              backgroundColor: pos ? C.openPanel : C.ironPanel,
              border: `1px solid ${pos ? C.openBrd : C.ironBrd}`,
              borderRadius: 6, padding: "3px 8px",
              fontWeight: 600,
            }}>
              {pos ? "+" : ""}{delta.toFixed(0)} pts OpenClaw
            </span>
          );
        })()}
      </div>

      {/* Two panels */}
      <div style={{ padding: 16, display: "flex", gap: 12 }}>
        <FrameworkPanel frameworkId="ironclaw" run={model.ironclaw} isMain={isMain === "ironclaw"} />
        <FrameworkPanel frameworkId="openclaw" run={model.openclaw} isMain={isMain === "openclaw"} />
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function CrossBenchDashboard({
  models,
  generatedAt,
}: {
  models: ModelCrossBench[];
  generatedAt: string;
}) {
  const [sort, setSort] = useState<SortKey>("passrate");

  const sorted = useMemo(
    () => [...models].sort((a, b) => sortValue(b, sort) - sortValue(a, sort)),
    [models, sort],
  );

  const generatedDate = new Date(generatedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const SORT_TABS: { id: SortKey; label: string }[] = [
    { id: "passrate", label: "Pass Rate" },
    { id: "speed",    label: "Speed" },
    { id: "cost",     label: "Cost" },
    { id: "value",    label: "Value" },
  ];

  const bothCount  = models.filter(m => m.ironclaw && m.openclaw).length;
  const ironOnly   = models.filter(m => m.ironclaw && !m.openclaw).length;
  const openOnly   = models.filter(m => !m.ironclaw && m.openclaw).length;

  return (
    <div style={{ backgroundColor: C.pageBg, minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{
        backgroundColor: C.navBg, borderBottom: `1px solid ${C.navBrd}`,
        position: "sticky", top: 0, zIndex: 40,
        padding: "0 28px", height: 56,
        display: "flex", alignItems: "center", gap: 20,
        boxShadow: "0 1px 3px rgba(79,70,229,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
            color: C.text, letterSpacing: "-0.03em",
          }}>
            NEAR AgentBench
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: C.accent, border: `1px solid ${C.cardBrd}`,
            borderRadius: 5, padding: "2px 7px",
            textTransform: "uppercase", letterSpacing: "0.08em",
            backgroundColor: "#F0F4FF",
          }}>
            Cross Bench
          </span>
        </div>

        {/* Sort tabs in nav */}
        <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          {SORT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSort(tab.id)}
              style={{
                fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer",
                padding: "6px 14px", borderRadius: 7, border: "none",
                backgroundColor: sort === tab.id ? "#EEF2FF" : "transparent",
                color: sort === tab.id ? C.accent : C.muted,
                fontWeight: sort === tab.id ? 600 : 400,
                transition: "all 120ms",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <a
          href="https://github.com/nearai/benchmarks"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: C.muted, textDecoration: "none", marginLeft: 8 }}
        >
          GitHub ↗
        </a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            margin: "0 0 8px", fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: 32, color: C.text, letterSpacing: "-0.03em",
          }}>
            Cross-Benchmark Leaderboard
          </h1>
          <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: C.muted, letterSpacing: "0.02em" }}>
            {models.length} model{models.length !== 1 ? "s" : ""}
            {bothCount > 0 && <> · <span style={{ color: C.accent }}>{bothCount} with both frameworks</span></>}
            {ironOnly > 0 && <> · {ironOnly} IronClaw only</>}
            {openOnly > 0 && <> · {openOnly} OpenClaw only</>}
            {" · "}updated {generatedDate}
          </p>
        </div>

        {/* Framework legend */}
        <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
          {[
            { color: C.iron, bg: C.ironPanel, label: "IronClaw" },
            { color: C.open, bg: C.openPanel, label: "OpenClaw" },
          ].map(fw => (
            <div key={fw.label} style={{
              display: "flex", alignItems: "center", gap: 7,
              backgroundColor: fw.bg, border: `1px solid ${fw.color}22`,
              borderRadius: 8, padding: "6px 14px",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: fw.color }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: fw.color, fontWeight: 600, letterSpacing: "0.04em" }}>
                {fw.label}
              </span>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sorted.map((model, i) => (
            <ModelCard key={model.normalKey} model={model} rank={i + 1} />
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 40, fontFamily: "var(--font-mono)", fontSize: 10,
          color: "#C7D2FE", textAlign: "center", letterSpacing: "0.04em",
        }}>
          Pass rate = % tasks with score = 1.0 · Source: nearai/benchmarks
        </p>
      </div>
    </div>
  );
}
