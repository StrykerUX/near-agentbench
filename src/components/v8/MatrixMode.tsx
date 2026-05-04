"use client";

import { useState, useMemo } from "react";
import type { ModelGroup, TaskResult } from "@/lib/benchUtils";
import { fmtCost, fmtTime, shortTaskId } from "@/lib/benchUtils";

const NAV_LINKS = [
  { href: "/v6", label: "Signal Cards", active: false },
  { href: "/v7", label: "Arena View",   active: false },
  { href: "/v8", label: "Matrix",       active: true },
];

type CellMeta = { task: TaskResult; fw: string; model: string };
type SortState = { taskId: string; dir: "desc" | "asc" } | null;

function cellStyle(label: string, score: number): React.CSSProperties {
  if (label === "pending") return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };
  if (score === 1)         return { backgroundColor: "#DCFCE7", color: "#15803D" };
  if (score > 0)           return { backgroundColor: "#FEF9C3", color: "#A16207" };
  return                          { backgroundColor: "#FEE2E2", color: "#B91C1C" };
}

function CellTooltip({ meta }: { meta: CellMeta }) {
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20,
      backgroundColor: "#1E293B", color: "#F8FAFC",
      borderRadius: 10, padding: "14px 18px",
      fontFamily: "var(--font-mono)", fontSize: 11,
      lineHeight: 1.8, zIndex: 100,
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      minWidth: 220, maxWidth: 300,
      border: "1px solid #334155",
    }}>
      <div style={{ fontWeight: 700, color: "#F1F5F9", marginBottom: 6, fontSize: 12 }}>{meta.task.taskId}</div>
      <div>model <span style={{ color: "#94A3B8" }}>{meta.model}</span></div>
      <div>framework <span style={{ color: "#94A3B8" }}>{meta.fw}</span></div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #334155" }}>
        <div>score <span style={{ color: meta.task.score === 1 ? "#4ADE80" : meta.task.score > 0 ? "#FCD34D" : "#F87171", fontWeight: 700 }}>{meta.task.score.toFixed(3)}</span> · {meta.task.label}</div>
        <div style={{ color: "#94A3B8" }}>{meta.task.tokens.toLocaleString()} tok · {fmtTime(meta.task.wallTimeMs)}</div>
        {meta.task.costUsd > 0 && <div style={{ color: "#94A3B8" }}>{fmtCost(meta.task.costUsd)}</div>}
        {meta.task.error && <div style={{ color: "#F87171", marginTop: 4 }}>{meta.task.error}</div>}
      </div>
    </div>
  );
}

type RowDef = {
  rowKey: string;
  modelName: string;
  fw: string;
  fwColor: string;
  tasks: Map<string, TaskResult>;
  passRate: number;
  suite: string;
};

export default function MatrixMode({ models, generatedAt }: { models: ModelGroup[]; generatedAt: string }) {
  const [hoveredRow,  setHoveredRow]  = useState<string | null>(null);
  const [hoveredCol,  setHoveredCol]  = useState<string | null>(null);
  const [tooltip,     setTooltip]     = useState<CellMeta | null>(null);
  const [suiteFilter, setSuiteFilter] = useState<string>("all");
  const [sortState,   setSortState]   = useState<SortState>(null);

  // Build flat row list
  const allRows: RowDef[] = useMemo(() => {
    const rows: RowDef[] = [];
    for (const m of models) {
      if (m.ironclaw) rows.push({
        rowKey: `${m.normalKey}-iron`, modelName: m.displayName, fw: "IronClaw", fwColor: "#EA580C",
        tasks: new Map(m.ironclaw.tasks.map((t) => [t.taskId, t])),
        passRate: m.ironclaw.passRate, suite: m.ironclaw.suite,
      });
      if (m.openclaw) rows.push({
        rowKey: `${m.normalKey}-open`, modelName: m.displayName, fw: "OpenClaw", fwColor: "#059669",
        tasks: new Map(m.openclaw.tasks.map((t) => [t.taskId, t])),
        passRate: m.openclaw.passRate, suite: m.openclaw.suite,
      });
    }
    return rows;
  }, [models]);

  const suites = useMemo(() => ["all", ...new Set(allRows.map((r) => r.suite))], [allRows]);

  const filteredRows = useMemo(() => {
    const rows = suiteFilter === "all" ? allRows : allRows.filter((r) => r.suite === suiteFilter);
    if (!sortState) return rows;
    return [...rows].sort((a, b) => {
      const as = a.tasks.get(sortState.taskId)?.score ?? -1;
      const bs = b.tasks.get(sortState.taskId)?.score ?? -1;
      return sortState.dir === "desc" ? bs - as : as - bs;
    });
  }, [allRows, suiteFilter, sortState]);

  // All task IDs for the current filter
  const allTaskIds = useMemo(() => {
    const ids = new Set<string>();
    filteredRows.forEach((r) => r.tasks.forEach((_, id) => ids.add(id)));
    return Array.from(ids);
  }, [filteredRows]);

  const handleColClick = (tid: string) => {
    setSortState((prev) =>
      prev?.taskId === tid ? { taskId: tid, dir: prev.dir === "desc" ? "asc" : "desc" } : { taskId: tid, dir: "desc" }
    );
  };

  const date = new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const CELL = 38;
  const ROW_LABEL = 200;

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      <nav style={{
        backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 28px", height: 52,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: "-0.02em", marginRight: 16 }}>
          NEAR AgentBench
        </span>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} style={{
            fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none",
            padding: "5px 12px", borderRadius: 6,
            backgroundColor: l.active ? "#1E293B" : "transparent",
            color: l.active ? "#F8FAFC" : "#64748B",
          }}>{l.label}</a>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          {suites.map((s) => (
            <button key={s} onClick={() => setSuiteFilter(s)} style={{
              fontFamily: "var(--font-mono)", fontSize: 10, cursor: "pointer",
              padding: "4px 10px", borderRadius: 5,
              border: `1px solid ${suiteFilter === s ? "#6366F1" : "#E2E8F0"}`,
              backgroundColor: suiteFilter === s ? "#EEF2FF" : "#FFF",
              color: suiteFilter === s ? "#4F46E5" : "#64748B",
              textTransform: "capitalize",
            }}>{s}</button>
          ))}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#CBD5E1", marginLeft: 12 }}>updated {date}</span>
        </div>
      </nav>

      <div style={{ padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "#0F172A", letterSpacing: "-0.03em" }}>
            Matrix
          </h1>
          <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "#94A3B8" }}>
            Hover for crosshair · Click column header to sort · {filteredRows.length} runs × {allTaskIds.length} tasks
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { bg: "#DCFCE7", color: "#15803D", label: "Pass (1.0)" },
            { bg: "#FEF9C3", color: "#A16207", label: "Partial" },
            { bg: "#FEE2E2", color: "#B91C1C", label: "Fail (0.0)" },
            { bg: "#DBEAFE", color: "#1D4ED8", label: "Pending" },
          ].map(({ bg, color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bg, border: `1px solid ${color}44` }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#64748B" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Scrollable matrix */}
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <table style={{ borderCollapse: "collapse", backgroundColor: "#FFFFFF", tableLayout: "fixed" }}>
            {/* Column headers */}
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                {/* Sticky row label header */}
                <th style={{
                  width: ROW_LABEL, minWidth: ROW_LABEL, padding: "10px 14px",
                  position: "sticky", left: 0, backgroundColor: "#F8FAFC",
                  borderRight: "1px solid #E2E8F0", zIndex: 10, textAlign: "left",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Model / Framework
                  </span>
                </th>

                {/* Pass rate column */}
                <th style={{
                  width: 60, minWidth: 60, padding: "10px 8px",
                  borderRight: "1px solid #E2E8F0",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", writingMode: "vertical-rl", transform: "rotate(180deg)", display: "block", textAlign: "center" }}>
                    Pass Rate
                  </span>
                </th>

                {/* Task columns */}
                {allTaskIds.map((tid) => {
                  const isSort = sortState?.taskId === tid;
                  // compute pass rate for this task across filtered rows
                  const scores = filteredRows.map((r) => r.tasks.get(tid)?.score ?? null).filter((s) => s !== null) as number[];
                  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                  return (
                    <th
                      key={tid}
                      onClick={() => handleColClick(tid)}
                      onMouseEnter={() => setHoveredCol(tid)}
                      onMouseLeave={() => setHoveredCol(null)}
                      style={{
                        width: CELL, minWidth: CELL,
                        padding: "4px 2px",
                        cursor: "pointer",
                        backgroundColor: isSort ? "#EEF2FF" : hoveredCol === tid ? "#F8FAFC" : "#F8FAFC",
                        transition: "background 80ms",
                        verticalAlign: "bottom",
                        borderRight: "1px solid #F1F5F9",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingBottom: 4 }}>
                        <div style={{
                          height: 24, width: 6, borderRadius: 3,
                          backgroundColor: avg > 0.9 ? "#DCFCE7" : avg > 0.5 ? "#FEF9C3" : "#FEE2E2",
                          alignSelf: "center",
                          position: "relative",
                        }}>
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            height: `${avg * 100}%`,
                            borderRadius: 3,
                            backgroundColor: avg > 0.9 ? "#4ADE80" : avg > 0.5 ? "#FCD34D" : "#F87171",
                          }} />
                        </div>
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: 8.5,
                          color: isSort ? "#4F46E5" : "#94A3B8",
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxHeight: 80,
                          letterSpacing: "0.02em",
                          display: "block",
                          whiteSpace: "nowrap",
                        }}>
                          {shortTaskId(tid)}{isSort ? (sortState?.dir === "desc" ? " ↓" : " ↑") : ""}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.rowKey}
                  onMouseEnter={() => setHoveredRow(row.rowKey)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  {/* Sticky row label */}
                  <td style={{
                    position: "sticky", left: 0, zIndex: 5,
                    backgroundColor: hoveredRow === row.rowKey ? "#F8FAFC" : "#FFFFFF",
                    borderRight: "1px solid #E2E8F0",
                    padding: "8px 14px",
                    width: ROW_LABEL, minWidth: ROW_LABEL,
                    transition: "background 80ms",
                  }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#374151", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.modelName}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: row.fwColor }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: row.fwColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {row.fw}
                      </span>
                    </div>
                  </td>

                  {/* Pass rate cell */}
                  <td style={{
                    textAlign: "center", padding: "0 8px",
                    borderRight: "1px solid #E2E8F0",
                    backgroundColor: hoveredRow === row.rowKey ? "#F8FAFC" : "#FFF",
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: row.fwColor }}>
                      {(row.passRate * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Task cells */}
                  {allTaskIds.map((tid) => {
                    const task = row.tasks.get(tid);
                    const isRowHover = hoveredRow === row.rowKey;
                    const isColHover = hoveredCol === tid;
                    const isCrosshair = isRowHover || isColHover;

                    return (
                      <td
                        key={tid}
                        onMouseEnter={() => { setHoveredCol(tid); setTooltip(task ? { task, fw: row.fw, model: row.modelName } : null); }}
                        onMouseLeave={() => { setHoveredCol(null); setTooltip(null); }}
                        style={{
                          width: CELL, minWidth: CELL, height: CELL,
                          padding: 3,
                          backgroundColor: isCrosshair ? "#EEF2FF" : "#FFF",
                          transition: "background 60ms",
                          borderRight: "1px solid #F1F5F9",
                        }}
                      >
                        {task ? (
                          <div style={{
                            width: "100%", height: "100%",
                            borderRadius: 4,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontFamily: "var(--font-mono)",
                            fontWeight: 700, cursor: "default",
                            ...cellStyle(task.label, task.score),
                          }}>
                            {task.score === 1 ? "✓" : task.score === 0 ? (task.label === "pending" ? "…" : "✗") : (task.score * 100).toFixed(0)}
                          </div>
                        ) : (
                          <div style={{ width: "100%", height: "100%", borderRadius: 4, backgroundColor: "#F8FAFC" }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 24, fontFamily: "var(--font-mono)", fontSize: 10, color: "#CBD5E1", textAlign: "center" }}>
          ✓ pass (1.0) · {"{n}"} partial score · ✗ fail · … pending · — no run
        </p>
      </div>

      {tooltip && <CellTooltip meta={tooltip} />}
    </div>
  );
}
