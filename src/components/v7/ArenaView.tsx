"use client";

import { useState, useEffect } from "react";
import type { ModelGroup, TaskResult } from "@/lib/benchUtils";
import { fmtCost, fmtTime } from "@/lib/benchUtils";

const IRON     = "#F97316";
const OPEN     = "#10B981";
const BG       = "#0D1117";
const BG_CARD  = "#161B22";
const BORDER   = "#21262D";
const TEXT     = "#E6EDF3";
const MUTED    = "#8B949E";
const MUTED2   = "#30363D";

const NAV_LINKS = [
  { href: "/v6", label: "Signal Cards", active: false },
  { href: "/v7", label: "Arena View",   active: true },
  { href: "/v8", label: "Matrix",       active: false },
];

type TaskComparison = {
  taskId: string;
  ironScore: number;
  ironLabel: string;
  ironError: string | null;
  openScore?: number;
  openLabel?: string;
  divergence: number;
  category: "diverge" | "agree-pass" | "agree-fail" | "single";
};

function buildComparisons(iron?: ModelGroup["ironclaw"], open?: ModelGroup["openclaw"]): TaskComparison[] {
  if (!iron && !open) return [];

  if (!open && iron) {
    return iron.tasks.map((t) => ({
      taskId: t.taskId, ironScore: t.score, ironLabel: t.label, ironError: t.error,
      divergence: 0, category: "single" as const,
    }));
  }
  if (!iron && open) {
    return open.tasks.map((t) => ({
      taskId: t.taskId, ironScore: t.score, ironLabel: t.label, ironError: t.error,
      openScore: t.score, openLabel: t.label,
      divergence: 0, category: "single" as const,
    }));
  }

  const openMap = new Map((open!.tasks).map((t) => [t.taskId, t]));
  const comps: TaskComparison[] = iron!.tasks.map((t) => {
    const o = openMap.get(t.taskId);
    const div = o ? Math.abs(t.score - o.score) : 0;
    const cat: TaskComparison["category"] =
      !o         ? "single"
    : div > 0.05 ? "diverge"
    : t.score > 0.9 && (o?.score ?? 0) > 0.9 ? "agree-pass"
    : "agree-fail";
    return {
      taskId: t.taskId, ironScore: t.score, ironLabel: t.label, ironError: t.error,
      openScore: o?.score, openLabel: o?.label,
      divergence: div, category: cat,
    };
  });
  return comps.sort((a, b) => b.divergence - a.divergence);
}

function ButterflyRow({
  comp, animated, index,
}: { comp: TaskComparison; animated: boolean; index: number }) {
  const maxWidth = 44; // percent of each side
  const ironW  = animated ? comp.ironScore * maxWidth : 0;
  const openW  = animated ? (comp.openScore ?? 0) * maxWidth : 0;
  const delay  = `${index * 28}ms`;

  const ironColor  = comp.ironLabel === "pass" ? IRON : comp.ironLabel === "partial" ? "#FB923C" : "#2D3748";
  const openColor  = comp.openLabel === "pass" ? OPEN : comp.openLabel === "partial" ? "#6EE7B7" : "#2D3748";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      padding: "5px 0",
      borderBottom: `1px solid ${MUTED2}11`,
    }}>
      {/* Iron bar — grows left */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, paddingRight: 16 }}>
        {comp.ironError && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#F87171" }}>⏱</span>
        )}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: ironColor }}>
          {comp.ironScore.toFixed(2)}
        </span>
        <div style={{ width: `${maxWidth}%`, display: "flex", justifyContent: "flex-end" }}>
          <div style={{
            height: 10, borderRadius: "2px 0 0 2px",
            backgroundColor: ironColor,
            width: `${ironW}%`,
            transition: `width 500ms ease-out ${delay}`,
            maxWidth: `${maxWidth}%`,
          }} />
        </div>
      </div>

      {/* Center task label */}
      <div style={{
        width: 200,
        textAlign: "center",
        padding: "0 12px",
        overflow: "hidden",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9.5,
          color: comp.category === "diverge" ? "#FCD34D" : MUTED,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}>
          {comp.taskId.replace(/task_\d+_/, "").replace(/^smoke-|^tool-|^chain-|^robust-|^memory-/, (m) => m)}
        </span>
      </div>

      {/* Open bar — grows right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 16 }}>
        <div style={{ width: `${maxWidth}%` }}>
          <div style={{
            height: 10, borderRadius: "0 2px 2px 0",
            backgroundColor: comp.openScore !== undefined ? openColor : "transparent",
            width: comp.openScore !== undefined ? `${openW}%` : 0,
            transition: `width 500ms ease-out ${delay}`,
          }} />
        </div>
        {comp.openScore !== undefined && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: openColor }}>
            {comp.openScore.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 0 8px",
    }}>
      <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 8.5, color,
        textTransform: "uppercase", letterSpacing: "0.14em",
        backgroundColor: BG_CARD, padding: "3px 10px",
        border: `1px solid ${BORDER}`, borderRadius: 3,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
    </div>
  );
}

function ModelArena({ model, animated }: { model: ModelGroup; animated: boolean }) {
  const iron = model.ironclaw;
  const open = model.openclaw;
  const comps = buildComparisons(iron, open);

  const divergent  = comps.filter((c) => c.category === "diverge");
  const agreePass  = comps.filter((c) => c.category === "agree-pass");
  const agreeFail  = comps.filter((c) => c.category === "agree-fail");
  const single     = comps.filter((c) => c.category === "single");

  let rowIndex = 0;

  return (
    <div style={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: "18px 24px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: TEXT, letterSpacing: "-0.02em" }}>
            {model.displayName}
          </p>
          <p style={{ margin: "3px 0 0", fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED, letterSpacing: "0.04em" }}>
            {model.provider} · {iron?.suite ?? open?.suite}
          </p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {iron && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: IRON, fontWeight: 700 }}>
                ● IronClaw {(iron.passRate * 100).toFixed(0)}%
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED }}>{fmtCost(iron.costUsd)} · {fmtTime(iron.wallTimeMs)}</div>
            </div>
          )}
          {open && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: OPEN, fontWeight: 700 }}>
                ● OpenClaw {(open.passRate * 100).toFixed(0)}%
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED }}>{fmtCost(open.costUsd)} · {fmtTime(open.wallTimeMs)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", padding: "10px 24px 4px", borderBottom: `1px solid ${BORDER}11` }}>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: IRON, textTransform: "uppercase", letterSpacing: "0.1em" }}>← IRONCLAW</span>
        </div>
        <div style={{ width: 200 }} />
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: OPEN, textTransform: "uppercase", letterSpacing: "0.1em" }}>OPENCLAW →</span>
        </div>
      </div>

      {/* Butterfly sections */}
      <div style={{ padding: "0 24px 16px" }}>
        {divergent.length > 0 && (
          <>
            <SectionLabel label={`${divergent.length} divergent task${divergent.length !== 1 ? "s" : ""}`} color="#FCD34D" />
            {divergent.map((c) => <ButterflyRow key={c.taskId} comp={c} animated={animated} index={rowIndex++} />)}
          </>
        )}
        {agreePass.length > 0 && (
          <>
            <SectionLabel label={`${agreePass.length} both pass`} color={OPEN} />
            {agreePass.map((c) => <ButterflyRow key={c.taskId} comp={c} animated={animated} index={rowIndex++} />)}
          </>
        )}
        {agreeFail.length > 0 && (
          <>
            <SectionLabel label={`${agreeFail.length} both struggle`} color={MUTED} />
            {agreeFail.map((c) => <ButterflyRow key={c.taskId} comp={c} animated={animated} index={rowIndex++} />)}
          </>
        )}
        {single.length > 0 && (
          <>
            <SectionLabel label={`${single.length} single framework`} color={IRON} />
            {single.map((c) => <ButterflyRow key={c.taskId} comp={c} animated={animated} index={rowIndex++} />)}
          </>
        )}
      </div>
    </div>
  );
}

export default function ArenaView({ models, generatedAt }: { models: ModelGroup[]; generatedAt: string }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, []);

  const date = new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      <nav style={{
        backgroundColor: "#161B22", borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
        padding: "0 28px", height: 52,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: TEXT, letterSpacing: "-0.02em", marginRight: 16 }}>
          NEAR AgentBench
        </span>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} style={{
            fontFamily: "var(--font-mono)", fontSize: 11, textDecoration: "none",
            padding: "5px 12px", borderRadius: 6,
            backgroundColor: l.active ? "#21262D" : "transparent",
            color: l.active ? TEXT : MUTED,
            border: l.active ? `1px solid ${BORDER}` : "1px solid transparent",
          }}>{l.label}</a>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED2 }}>updated {date}</span>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: TEXT, letterSpacing: "-0.03em" }}>
            Arena View
          </h1>
          <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: MUTED, letterSpacing: "0.02em" }}>
            Tasks sorted by divergence. Bars grow from center — where they split is where frameworks differ.
          </p>
        </div>

        {models.map((m) => <ModelArena key={m.normalKey} model={m} animated={animated} />)}
      </div>
    </div>
  );
}
