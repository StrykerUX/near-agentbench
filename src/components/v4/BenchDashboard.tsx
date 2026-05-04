"use client";

import { useState, useMemo } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const BG        = "#0D1117";
const BG_CARD   = "#161B22";
const BG_NAV    = "#161B22";
const BORDER    = "#30363D";
const TEXT      = "#E6EDF3";
const MUTED     = "#8B949E";
const SUITE_CLR = "#FF8C00";

const FW_COLORS: Record<string, string> = {
  ironclaw: "#FF8C00",
  openclaw: "#00EC97",
  nanobot:  "#4D9EFF",
};
const FW_NAMES: Record<string, string> = {
  ironclaw: "IronClaw",
  openclaw: "OpenClaw",
  nanobot:  "NanoBot",
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface RunData {
  runId: string;
  frameworkId: string;
  modelId: string;
  modelName: string;
  provider: string;
  suiteId: string;
  suiteName: string;
  dataset: string;
  passRate: number;
  avgScore: number;
  costUsd: number;
  wallTimeMs: number;
  totalTasks: number;
  completedTasks: number;
  scoreSum: number;
  valueScore: number;
  isOfficial: boolean;
  tasks?: Array<{ task_id: string; score: number; label: string; cost_usd: number; wall_time_ms: number; tokens: number; error: string | null }>;
}

type SortTab  = "success" | "speed" | "cost" | "value";
type ViewMode = "cards" | "table";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCost(usd: number) {
  return `$${usd.toFixed(4)}`;
}
function fmtTime(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ── Circular Gauge ───────────────────────────────────────────────────────────

function CircleGauge({ value, color }: { value: number; color: string }) {
  const r    = 42;
  const cx   = 56;
  const cy   = 56;
  const sw   = 9;
  const circ = 2 * Math.PI * r;
  const fill = circ * Math.min(value, 1);

  return (
    <svg width={112} height={112} viewBox="0 0 112 112" style={{ display: "block" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#21262D" strokeWidth={sw} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ - fill}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize="18" fontWeight="700"
        fontFamily="var(--font-mono)"
      >
        {Math.round(value * 100)}%
      </text>
    </svg>
  );
}

// ── Run Card ─────────────────────────────────────────────────────────────────

function RunCard({ run, sortTab }: { run: RunData; sortTab: SortTab }) {
  const [expanded, setExpanded] = useState(false);
  const color = FW_COLORS[run.frameworkId] ?? "#666";
  const name  = FW_NAMES[run.frameworkId]  ?? run.frameworkId;

  const highlightValue = sortTab === "speed" ? fmtTime(run.wallTimeMs)
                       : sortTab === "cost"  ? fmtCost(run.costUsd)
                       : sortTab === "value" ? run.valueScore.toFixed(1)
                       : null;

  return (
    <div
      style={{
        backgroundColor: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: 20,
        width: 320,
        flexShrink: 0,
      }}
    >
      {/* Framework badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: TEXT, fontWeight: 500 }}>
          {name}
        </span>
        {run.isOfficial && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: color,
            border: `1px solid ${color}`, borderRadius: 3, padding: "1px 5px", marginLeft: "auto",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            official
          </span>
        )}
      </div>

      {/* Gauge */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <CircleGauge value={run.passRate} color={color} />
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 12 }}>
        <Stat label="Cost"      value={fmtCost(run.costUsd)}                bold={sortTab === "cost"}  color={sortTab === "cost"  ? color : undefined} />
        <Stat label="Time"      value={fmtTime(run.wallTimeMs)}             bold={sortTab === "speed"} color={sortTab === "speed" ? color : undefined} />
        <Stat label="Tasks"     value={`${run.scoreSum.toFixed(2)}/${run.totalTasks}`} />
        <Stat label="Avg score" value={run.avgScore.toFixed(3)}             bold={sortTab === "success"} color={sortTab === "success" ? color : undefined} />
        {sortTab === "value" && (
          <Stat label="Value" value={run.valueScore.toFixed(1)} bold color={color} />
        )}
      </div>

      {/* Caption */}
      <p style={{
        fontFamily: "var(--font-mono)", fontSize: 10, color: "#444",
        textAlign: "center", margin: "0 0 8px", letterSpacing: "0.02em",
      }}>
        Gauge = % fully passed (score = 1.0)
      </p>

      {/* Run ID */}
      <p
        style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color: "#333",
          textAlign: "center", margin: 0, letterSpacing: "0.01em",
          cursor: "pointer",
          wordBreak: "break-all",
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {run.runId}
      </p>

      {/* Task breakdown (expandable) */}
      {expanded && run.tasks && run.tasks.length > 0 && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED, marginBottom: 8 }}>
            TASK BREAKDOWN
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
            {run.tasks.map(t => {
              const labelColor = t.label === "pass" ? "#00EC97"
                               : t.label === "partial" ? "#FF8C00"
                               : t.label === "pending" ? "#4D9EFF"
                               : "#555";
              return (
                <div key={t.task_id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MUTED, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.task_id}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: labelColor, flexShrink: 0 }}>
                    {t.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: TEXT, flexShrink: 0, width: 32, textAlign: "right" }}>
                    {t.score.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: MUTED }}>{label}: </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: color ?? TEXT, fontWeight: bold ? 600 : 400 }}>
        {value}
      </span>
    </div>
  );
}

// ── Table row ────────────────────────────────────────────────────────────────

function TableRow({ run, rank }: { run: RunData; rank: number }) {
  const color = FW_COLORS[run.frameworkId] ?? "#666";
  const name  = FW_NAMES[run.frameworkId]  ?? run.frameworkId;

  const TH_STYLE: React.CSSProperties = {
    padding: "10px 14px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: TEXT,
    verticalAlign: "middle",
    borderBottom: `1px solid ${BORDER}`,
    whiteSpace: "nowrap",
  };

  return (
    <tr style={{ transition: "background 120ms" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#1C2128")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ ...TH_STYLE, color: MUTED, width: 40 }}>{rank}</td>
      <td style={{ ...TH_STYLE }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
          {name}
        </div>
      </td>
      <td style={{ ...TH_STYLE }}>{run.modelName}</td>
      <td style={{ ...TH_STYLE, color: MUTED }}>{run.provider}</td>
      <td style={{ ...TH_STYLE }}>{run.suiteName}</td>
      <td style={{ ...TH_STYLE, color: color, fontWeight: 600 }}>{(run.passRate * 100).toFixed(1)}%</td>
      <td style={{ ...TH_STYLE }}>{run.avgScore.toFixed(3)}</td>
      <td style={{ ...TH_STYLE }}>{fmtCost(run.costUsd)}</td>
      <td style={{ ...TH_STYLE }}>{fmtTime(run.wallTimeMs)}</td>
      <td style={{ ...TH_STYLE, color: MUTED }}>{run.scoreSum.toFixed(2)}/{run.totalTasks}</td>
    </tr>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function BenchDashboard({
  runs,
  suiteOptions,
  datasetOptions,
  modelOptions,
  frameworkOptions,
  generatedAt,
}: {
  runs: RunData[];
  suiteOptions: string[];
  datasetOptions: string[];
  modelOptions: string[];
  frameworkOptions: string[];
  generatedAt: string;
}) {
  const [suiteFilter,     setSuiteFilter]     = useState("all");
  const [frameworkFilter, setFrameworkFilter] = useState("all");
  const [datasetFilter,   setDatasetFilter]   = useState("all");
  const [sortTab,         setSortTab]         = useState<SortTab>("success");
  const [viewMode,        setViewMode]        = useState<ViewMode>("cards");

  const filtered = useMemo(() => {
    let r = runs;
    if (suiteFilter     !== "all") r = r.filter(x => x.suiteId     === suiteFilter);
    if (frameworkFilter !== "all") r = r.filter(x => x.frameworkId === frameworkFilter);
    if (datasetFilter   !== "all") r = r.filter(x => x.dataset     === datasetFilter);

    return [...r].sort((a, b) =>
      sortTab === "speed" ? a.wallTimeMs - b.wallTimeMs
    : sortTab === "cost"  ? a.costUsd    - b.costUsd
    : sortTab === "value" ? b.valueScore - a.valueScore
    : b.passRate - a.passRate
    );
  }, [runs, suiteFilter, frameworkFilter, datasetFilter, sortTab]);

  // Build hierarchy: suite → dataset → model → runs
  const grouped = useMemo(() => {
    const bySuite = new Map<string, {
      name: string;
      byDataset: Map<string, {
        byModel: Map<string, { modelName: string; provider: string; runs: RunData[] }>;
      }>;
    }>();

    for (const run of filtered) {
      if (!bySuite.has(run.suiteId)) {
        bySuite.set(run.suiteId, { name: run.suiteName, byDataset: new Map() });
      }
      const suite = bySuite.get(run.suiteId)!;
      if (!suite.byDataset.has(run.dataset)) {
        suite.byDataset.set(run.dataset, { byModel: new Map() });
      }
      const ds = suite.byDataset.get(run.dataset)!;
      if (!ds.byModel.has(run.modelId)) {
        ds.byModel.set(run.modelId, { modelName: run.modelName, provider: run.provider, runs: [] });
      }
      ds.byModel.get(run.modelId)!.runs.push(run);
    }
    return bySuite;
  }, [filtered]);

  const SORT_TABS: { id: SortTab; label: string }[] = [
    { id: "success", label: "Success Rate" },
    { id: "speed",   label: "Speed" },
    { id: "cost",    label: "Cost" },
    { id: "value",   label: "Value" },
  ];

  const generatedDate = new Date(generatedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{
        backgroundColor: BG_NAV, borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
          color: SUITE_CLR, letterSpacing: "-0.01em",
        }}>
          Claw Bench
        </span>

        <div style={{ display: "flex", gap: 2 }}>
          {(["Leaderboard", "About"] as const).map(tab => (
            <span key={tab} style={{
              fontFamily: "var(--font-sans)", fontSize: 14, color: tab === "Leaderboard" ? TEXT : MUTED,
              padding: "6px 12px", borderRadius: 6, cursor: "default",
              backgroundColor: tab === "Leaderboard" ? "#21262D" : "transparent",
              border: tab === "Leaderboard" ? `1px solid ${BORDER}` : "1px solid transparent",
            }}>
              {tab}
            </span>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#333", letterSpacing: "0.04em" }}>
            updated {generatedDate}
          </span>
          <a
            href="https://github.com/nearai/benchmarks"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: MUTED, textDecoration: "none" }}
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Page title + filter bar */}
        <div style={{
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between",
          gap: 16, marginBottom: 24,
        }}>
          <h1 style={{
            margin: 0, fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 28, color: TEXT, letterSpacing: "-0.02em",
          }}>
            Leaderboard
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <Select
              value={frameworkFilter}
              onChange={setFrameworkFilter}
              options={[["all", "All Frameworks"], ...frameworkOptions.map(f => [f, FW_NAMES[f] ?? f] as [string, string])]}
            />
            <Select
              value={suiteFilter}
              onChange={setSuiteFilter}
              options={[["all", "All Suites"], ...suiteOptions.map(s => [s, s] as [string, string])]}
            />
            <Select
              value={datasetFilter}
              onChange={setDatasetFilter}
              options={[["all", "All Datasets"], ...datasetOptions.map(d => [d, d] as [string, string])]}
            />
          </div>
        </div>

        {/* Sort tabs + view toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, marginBottom: 28, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            {SORT_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setSortTab(t.id)}
                style={{
                  fontFamily: "var(--font-sans)", fontSize: 14,
                  padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${sortTab === t.id ? BORDER : "transparent"}`,
                  backgroundColor: sortTab === t.id ? "#21262D" : "transparent",
                  color: sortTab === t.id ? TEXT : MUTED,
                  transition: "all 120ms",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{
            display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden",
          }}>
            {(["cards", "table"] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  fontFamily: "var(--font-sans)", fontSize: 14,
                  padding: "7px 16px", cursor: "pointer", border: "none",
                  backgroundColor: viewMode === v ? "#21262D" : "transparent",
                  color: viewMode === v ? TEXT : MUTED,
                  textTransform: "capitalize",
                  transition: "background 120ms",
                }}
              >
                {v === "cards" ? "Cards" : "Table"}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "#444",
          marginBottom: 24, letterSpacing: "0.04em",
        }}>
          {filtered.length} run{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 8, backgroundColor: BG_CARD }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Framework", "Model", "Provider", "Suite", "Pass Rate", "Avg Score", "Cost", "Time", "Tasks"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 9,
                      color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em",
                      fontWeight: 400, textAlign: "left", borderBottom: `1px solid ${BORDER}`,
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((run, i) => <TableRow key={run.runId} run={run} rank={i + 1} />)}
              </tbody>
            </table>
          </div>
        )}

        {/* CARDS VIEW — grouped by suite → dataset → model */}
        {viewMode === "cards" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {Array.from(grouped.entries()).map(([suiteId, suite]) => (
              <div key={suiteId}>
                {/* Suite header */}
                <h2 style={{
                  margin: "0 0 16px",
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 22, color: SUITE_CLR, letterSpacing: "-0.01em",
                }}>
                  {suite.name}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {Array.from(suite.byDataset.entries()).map(([dsId, ds]) => (
                    <div key={dsId}>
                      {/* Dataset subheader */}
                      <p style={{
                        margin: "0 0 16px", fontFamily: "var(--font-mono)",
                        fontSize: 12, color: MUTED, letterSpacing: "0.04em",
                      }}>
                        {dsId}
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {Array.from(ds.byModel.entries()).map(([modelId, model]) => (
                          <div key={modelId}>
                            {/* Model name row */}
                            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                              <span style={{
                                fontFamily: "var(--font-mono)", fontWeight: 600,
                                fontSize: 14, color: TEXT,
                              }}>
                                {model.modelName}
                              </span>
                              <span style={{
                                fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED,
                              }}>
                                {model.provider}
                              </span>
                            </div>

                            {/* Run cards — horizontal scroll on narrow screens */}
                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                              {model.runs.map(run => (
                                <RunCard key={run.runId} run={run} sortTab={sortTab} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Select helper ────────────────────────────────────────────────────────────

function Select({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        fontFamily: "var(--font-sans)", fontSize: 14,
        backgroundColor: BG_CARD, color: TEXT,
        border: `1px solid ${BORDER}`, borderRadius: 6,
        padding: "7px 28px 7px 12px", cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B949E' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        outline: "none",
      }}
    >
      {options.map(([val, label]) => (
        <option key={val} value={val}>{label}</option>
      ))}
    </select>
  );
}
