"use client";

import { useState, useEffect, useRef } from "react";
import type { ModelGroup, TaskResult, RunData } from "@/lib/benchUtils";
import { fmtCost, fmtTime } from "@/lib/benchUtils";

const IRON = "#EA580C";
const OPEN = "#059669";
const IRON_RGB = "234,88,12";
const OPEN_RGB = "5,150,105";

const NAV_LINKS = [
  { href: "/v6", label: "Signal Cards", active: true },
  { href: "/v7", label: "Arena View",   active: false },
  { href: "/v8", label: "Matrix",       active: false },
];

function cellBg(task: TaskResult, fw: "iron" | "open"): string {
  if (task.label === "pending") return "#BFDBFE";
  if (task.score === 0) return "#F1F5F9";
  const rgb = fw === "iron" ? IRON_RGB : OPEN_RGB;
  const alpha = Math.max(0.25, task.score).toFixed(2);
  return `rgba(${rgb},${alpha})`;
}

function HeatGrid({
  tasks, fw, animate,
  onCellHover, onCellLeave,
}: {
  tasks: TaskResult[];
  fw: "iron" | "open";
  animate: boolean;
  onCellHover: (t: TaskResult, el: HTMLDivElement) => void;
  onCellLeave: () => void;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, 18px)",
      gap: 3,
    }}>
      {tasks.map((t, i) => (
        <div
          key={t.taskId}
          style={{
            width: 18, height: 18,
            borderRadius: 3,
            backgroundColor: cellBg(t, fw),
            opacity: animate ? 1 : 0,
            transform: animate ? "scale(1)" : "scale(0.3)",
            transition: `opacity 200ms ease ${i * 22}ms, transform 200ms ease ${i * 22}ms`,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => onCellHover(t, e.currentTarget as HTMLDivElement)}
          onMouseLeave={onCellLeave}
        />
      ))}
    </div>
  );
}

function Tooltip({ task, anchor }: { task: TaskResult; anchor: DOMRect }) {
  const labelColor = task.label === "pass" ? OPEN : task.label === "partial" ? "#D97706" : task.label === "pending" ? "#3B82F6" : "#9CA3AF";
  return (
    <div style={{
      position: "fixed",
      left: anchor.left + anchor.width / 2,
      top: anchor.top - 8,
      transform: "translate(-50%, -100%)",
      backgroundColor: "#111827",
      color: "#F9FAFB",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "var(--font-mono)",
      lineHeight: 1.7,
      zIndex: 100,
      pointerEvents: "none",
      minWidth: 180,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 11, letterSpacing: "0.04em" }}>
        {task.taskId}
      </div>
      <div>score <span style={{ color: labelColor, fontWeight: 600 }}>{task.score.toFixed(3)}</span> · <span style={{ color: labelColor }}>{task.label}</span></div>
      <div style={{ color: "#9CA3AF" }}>{task.tokens.toLocaleString()} tok · {fmtTime(task.wallTimeMs)}</div>
      {task.error && <div style={{ color: "#F87171", marginTop: 4, fontSize: 10 }}>{task.error}</div>}
    </div>
  );
}

function DetailDrawer({ model, onClose }: { model: ModelGroup; onClose: () => void }) {
  const iron = model.ironclaw;
  const open = model.openclaw;

  type Comparison = {
    taskId: string;
    ironScore?: number;
    ironLabel?: string;
    ironError?: string | null;
    openScore?: number;
    openLabel?: string;
    divergence: number;
  };

  const comparisons: Comparison[] = [];
  if (iron) {
    const openMap = new Map((open?.tasks ?? []).map((t) => [t.taskId, t]));
    for (const t of iron.tasks) {
      const o = openMap.get(t.taskId);
      comparisons.push({
        taskId: t.taskId,
        ironScore: t.score, ironLabel: t.label, ironError: t.error,
        openScore: o?.score, openLabel: o?.label,
        divergence: o !== undefined ? Math.abs(t.score - o.score) : 0,
      });
    }
    comparisons.sort((a, b) => b.divergence - a.divergence);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex",
    }}>
      <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{
        width: 480, backgroundColor: "#FFFFFF", overflowY: "auto",
        borderLeft: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column",
      }}>
        {/* Drawer header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, backgroundColor: "#FFF", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#111827", letterSpacing: "-0.02em" }}>
                {model.displayName}
              </p>
              <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: 11, color: "#9CA3AF" }}>{model.provider}</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, color: "#6B7280" }}>
              ESC
            </button>
          </div>
          {iron && open && (
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: IRON }}>● IronClaw {(iron.passRate * 100).toFixed(0)}%</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: OPEN }}>● OpenClaw {(open.passRate * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Task list */}
        <div style={{ flex: 1, padding: "8px 0" }}>
          {comparisons.map((c) => {
            const div = c.openScore !== undefined ? Math.abs((c.ironScore ?? 0) - c.openScore) : 0;
            const isDivergent = div > 0.1;
            const labelColor = (lbl?: string) =>
              lbl === "pass" ? OPEN : lbl === "partial" ? "#D97706" : lbl === "pending" ? "#3B82F6" : "#9CA3AF";

            return (
              <div key={c.taskId} style={{
                padding: "10px 24px",
                borderBottom: "1px solid #F8FAFC",
                backgroundColor: isDivergent ? "#FFFBF5" : "transparent",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#374151", marginBottom: 6, letterSpacing: "0.02em" }}>
                  {c.taskId}
                  {isDivergent && <span style={{ marginLeft: 8, color: "#D97706", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em" }}>diverge</span>}
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: labelColor(c.ironLabel) }}>
                    ● {c.ironScore?.toFixed(2) ?? "—"} {c.ironLabel}
                    {c.ironError && <span style={{ color: "#F87171" }}> ⏱</span>}
                  </span>
                  {c.openScore !== undefined && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: labelColor(c.openLabel) }}>
                      ● {c.openScore.toFixed(2)} {c.openLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* If only one framework */}
          {!iron && open && open.tasks.map((t) => (
            <div key={t.taskId} style={{ padding: "10px 24px", borderBottom: "1px solid #F8FAFC" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#374151", marginBottom: 4 }}>{t.taskId}</div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: OPEN }}>● {t.score.toFixed(2)} {t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelCard({ model, animate }: { model: ModelGroup; animate: boolean }) {
  const [tooltip, setTooltip] = useState<{ task: TaskResult; rect: DOMRect } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const iron = model.ironclaw;
  const open = model.openclaw;

  const handleCellHover = (t: TaskResult, el: HTMLDivElement) => {
    setTooltip({ task: t, rect: el.getBoundingClientRect() });
  };

  const delta = iron && open ? ((open.passRate - iron.passRate) * 100) : null;

  return (
    <>
      <div
        onClick={() => setDrawerOpen(true)}
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: "20px 22px",
          cursor: "pointer",
          transition: "box-shadow 150ms, transform 150ms",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#111827", letterSpacing: "-0.02em" }}>
              {model.displayName}
            </p>
            <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: 10, color: "#9CA3AF", letterSpacing: "0.04em" }}>
              {model.provider} {model.ironclaw?.isOfficial && "· official ✓"}
            </p>
          </div>
          {delta !== null && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              color: delta >= 0 ? OPEN : IRON,
              backgroundColor: delta >= 0 ? "#F0FDF4" : "#FFF7ED",
              border: `1px solid ${delta >= 0 ? "#A7F3D0" : "#FED7AA"}`,
              borderRadius: 6, padding: "3px 8px",
            }}>
              {delta >= 0 ? "+" : ""}{delta.toFixed(0)} pts
            </span>
          )}
        </div>

        {/* Grids */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {iron && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: IRON }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: IRON, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  IronClaw
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#374151", marginLeft: 4, fontWeight: 700 }}>
                  {(iron.passRate * 100).toFixed(0)}%
                </span>
              </div>
              <HeatGrid tasks={iron.tasks} fw="iron" animate={animate} onCellHover={handleCellHover} onCellLeave={() => setTooltip(null)} />
            </div>
          )}
          {open && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: OPEN }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: OPEN, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  OpenClaw
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#374151", marginLeft: 4, fontWeight: 700 }}>
                  {(open.passRate * 100).toFixed(0)}%
                </span>
              </div>
              <HeatGrid tasks={open.tasks} fw="open" animate={animate} onCellHover={handleCellHover} onCellLeave={() => setTooltip(null)} />
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 14, borderTop: "1px solid #F1F5F9", flexWrap: "wrap" }}>
          {iron && <Chip label="Cost" value={fmtCost(iron.costUsd)} color={IRON} />}
          {iron && <Chip label="Time" value={fmtTime(iron.wallTimeMs)} color={IRON} />}
          {iron && <Chip label="Avg" value={iron.avgScore.toFixed(3)} color="#6B7280" />}
          {open && <Chip label="OC Time" value={fmtTime(open.wallTimeMs)} color={OPEN} />}
        </div>
      </div>

      {tooltip && <Tooltip task={tooltip.task} anchor={tooltip.rect} />}
      {drawerOpen && <DetailDrawer model={model} onClose={() => setDrawerOpen(false)} />}
    </>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function SignalCards({ models, generatedAt }: { models: ModelGroup[]; generatedAt: string }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 80); return () => clearTimeout(t); }, []);

  const date = new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ backgroundColor: "#F1F5F9", minHeight: "100vh" }}>
      <nav style={{
        backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0",
        position: "sticky", top: 0, zIndex: 40,
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
            transition: "all 120ms",
          }}>{l.label}</a>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, color: "#CBD5E1" }}>updated {date}</span>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "#0F172A", letterSpacing: "-0.03em" }}>
            Signal Cards
          </h1>
          <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "#94A3B8", letterSpacing: "0.02em" }}>
            Each cell = one benchmark task. Click any card for task-level breakdown.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
          {models.map((m) => (
            <ModelCard key={m.normalKey} model={m} animate={animate} />
          ))}
        </div>

        <p style={{ marginTop: 36, fontFamily: "var(--font-mono)", fontSize: 10, color: "#CBD5E1", textAlign: "center" }}>
          ■ pass · ▪ partial · □ fail · · pending · Source: nearai/benchmarks
        </p>
      </div>
    </div>
  );
}
