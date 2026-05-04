"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { fmtCost, fmtTime } from "@/lib/benchUtils";
import type { TaskResult } from "@/lib/benchUtils";

// ── V2 Palette ────────────────────────────────────────────────────────────────
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

// Sort accent colors (v2 convention)
const SORT_COLOR: Record<string, string> = {
  score: "#00EC97",
  speed: "#2979FF",
  cost:  "#FFB800",
  value: "#00EC97",
};

const NAV_LINKS = [
  { href: "/v6", label: "SIGNAL" },
  { href: "/v7", label: "ARENA" },
  { href: "/v8", label: "MATRIX" },
];

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
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#666", letterSpacing: "0.04em" }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

// ── Task label chip (v2 dark style) ──────────────────────────────────────────
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
      fontFamily: "var(--font-pixel)", fontSize: 6,
      textTransform: "uppercase", letterSpacing: "0.06em",
      padding: "3px 6px",
      backgroundColor: s.bg, color: s.color,
      border: `1px solid ${s.color}33`,
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

// ── Modal (v2 dark) ───────────────────────────────────────────────────────────
function TaskModal({ run, onClose }: { run: RawRun; onClose: () => void }) {
  const color  = fwColor(run.frameworkId);
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
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: TEXT, letterSpacing: "-0.02em" }}>
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
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 48, color, lineHeight: 1, marginBottom: 6 }}>
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

// ── Score Card ────────────────────────────────────────────────────────────────
function ScoreCard({ run, rank, onClick }: { run: RawRun; rank: number; sortKey: SortKey; onClick: () => void }) {
  const color = fwColor(run.frameworkId);

  return (
    <div
      onClick={onClick}
      style={{
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
        fontFamily: "var(--font-condensed)", fontSize: 72,
        color: "#FFFFFF", opacity: 0.05,
        lineHeight: 1, pointerEvents: "none", userSelect: "none",
        letterSpacing: "-0.02em",
      }}>
        #{rank}
      </span>

      {/* Top: framework badge + OFFICIAL */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2, flexShrink: 0 }} />
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
          color, letterSpacing: "0.01em",
        }}>
          {fwLabel(run.frameworkId)}
        </span>
        {run.isOfficial && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "#00EC97",
            border: "1px solid #00EC97", padding: "2px 7px",
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginLeft: "auto",
          }}>OFFICIAL</span>
        )}
      </div>

      {/* Model name + provider chip */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 48 }}>
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 19,
          color: "#FFFFFF", lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {run.modelName}
        </span>
        {run.provider && (
          <span style={{
            display: "inline-block", alignSelf: "flex-start",
            fontFamily: "var(--font-mono)", fontSize: 9, color: "#777",
            border: "1px solid #333", borderRadius: 4,
            padding: "3px 10px",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            {run.provider}
          </span>
        )}
      </div>

      {/* Hero score */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{
          fontFamily: "var(--font-condensed)", fontSize: 56,
          color, lineHeight: 0.9, letterSpacing: "-0.02em",
        }}>
          {(run.passRate * 100).toFixed(0)}%
        </div>
        <PixelGauge percentage={run.passRate * 100} frameworkId={run.frameworkId} />
      </div>

      {/* Suite / dataset */}
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, color: "#555",
        letterSpacing: "0.08em", textTransform: "uppercase",
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
              fontFamily: "var(--font-mono)", fontSize: 9, color: "#555",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#AAAAAA", fontWeight: 500 }}>
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
          fontFamily: "var(--font-mono)", fontSize: 9, color: "#3A3A3A",
          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          letterSpacing: "0.03em",
        }}>
          ▪ {run.runId}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color,
          fontWeight: 600, letterSpacing: "0.06em", flexShrink: 0,
        }}>
          DETAILS →
        </span>
      </div>
    </div>
  );
}

// ── Navbar (v2 style adapted) ─────────────────────────────────────────────────
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
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: `2px solid ${scrolled ? BORDER : "transparent"}`,
      backgroundColor: scrolled ? "rgba(17,17,17,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      padding: "0 24px",
      transition: "border-color 200ms, background-color 200ms",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", height: 56, display: "flex", alignItems: "center", gap: 20 }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{ fontFamily: "var(--font-condensed)", fontSize: 18, color: TEXT, letterSpacing: "0.02em", lineHeight: 1 }}>
            NEAR
          </span>
          <div style={{ width: 4, height: 4, backgroundColor: "#00EC97" }} />
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: "#00EC97", letterSpacing: "0.06em", lineHeight: 1 }}>
            AGENTBENCH
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#111", backgroundColor: "#00EC97", padding: "2px 5px", letterSpacing: "0.06em" }}>
            V9
          </span>
        </div>

        {/* Sort tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {SORT_OPTS.map((o) => {
            const active = sortKey === o.id;
            const ac = SORT_COLOR[o.id];
            return (
              <button key={o.id} onClick={() => onSort(o.id)} style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                padding: "5px 12px", cursor: "pointer",
                border: active ? `2px solid ${ac}` : "2px solid transparent",
                backgroundColor: "transparent",
                color: active ? ac : "#555",
                letterSpacing: "0.08em",
                transition: "color 80ms step-start, border-color 80ms step-start",
              }}>
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Other versions */}
        <div style={{ display: "flex", gap: 16 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{
              fontFamily: "var(--font-mono)", fontSize: 10, color: "#555",
              textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none",
            }}>
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScoreWall({ runs, generatedAt }: { runs: RawRun[]; generatedAt: string }) {
  const [sort, setSort]         = useState<SortKey>("score");
  const [selected, setSelected] = useState<RawRun | null>(null);

  const sorted = useMemo(() => [...runs].sort((a, b) =>
    sort === "speed" ? a.wallTimeMs - b.wallTimeMs
  : sort === "cost"  ? a.costUsd - b.costUsd
  : sort === "value" ? b.valueScore - a.valueScore
  : b.passRate - a.passRate
  ), [runs, sort]);

  const date = new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ backgroundColor: "#000000", padding: "48px 32px 120px" }}>
      <div style={{
        maxWidth: 1120, margin: "0 auto",
        backgroundColor: "#181818",
        borderRadius: 28,
        padding: "48px 40px 48px",
      }}>

        {/* ── Section header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          {/* Pixel color blocks */}
          <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
            {["#E8A045","#FFB800","#2979FF","#2979FF","#00EC97","#00EC97"].map((c, i) => (
              <div key={i} style={{ width: 20, height: 12, backgroundColor: c }} />
            ))}
          </div>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div>
              <h2 style={{
                margin: "0 0 10px",
                fontFamily: "var(--font-condensed)", fontSize: 56, color: "#FFFFFF",
                letterSpacing: "0.04em", lineHeight: 1, textTransform: "uppercase",
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

        {/* ── Cards grid ──────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {sorted.map((run, i) => (
            <ScoreCard key={run.runId} run={run} rank={i + 1} sortKey={sort} onClick={() => setSelected(run)} />
          ))}
        </div>

        {/* ── CTA Banner ──────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 40,
          backgroundColor: "#1E1E1E",
          borderRadius: 14,
          padding: "28px 36px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}>
          {/* Trophy emoji */}
          <div style={{ fontSize: 64, lineHeight: 1, flexShrink: 0, userSelect: "none" }}>
            🏆
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <p style={{
              margin: "0 0 6px",
              fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20,
              color: "#FFFFFF", lineHeight: 1.2,
            }}>
              Ready to benchmark your agent?
            </p>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 14,
              color: "#777777", lineHeight: 1.5,
            }}>
              Join the community of builders pushing<br />
              the boundaries of AI agents.
            </p>
          </div>

          {/* CTA Button */}
          <a
            href="#get-started"
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
  );
}
