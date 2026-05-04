"use client";

import { useState } from "react";
import ModelCard from "./ModelCard";
import LeaderboardTable from "./LeaderboardTable";
import GsapScrollReveal from "./GsapScrollReveal";
import type { BenchmarkVersion, LeaderboardEntry, SortTab, ViewMode } from "@/lib/types";

const TABS: { id: SortTab; label: string }[] = [
  { id: "score",  label: "Success Rate" },
  { id: "speed",  label: "Speed"        },
  { id: "cost",   label: "Cost"         },
  { id: "value",  label: "Value"        },
];

function sortEntries(entries: LeaderboardEntry[], tab: SortTab): LeaderboardEntry[] {
  const sorted = [...entries];
  if (tab === "speed") {
    sorted.sort((a, b) => {
      const ta = a.best_execution_time_seconds ?? Infinity;
      const tb = b.best_execution_time_seconds ?? Infinity;
      return ta - tb;
    });
  } else if (tab === "cost") {
    sorted.sort((a, b) => {
      const ca = a.best_cost_usd ?? Infinity;
      const cb = b.best_cost_usd ?? Infinity;
      return ca - cb;
    });
  } else if (tab === "value") {
    sorted.sort((a, b) => {
      const va = a.best_cost_usd ? a.best_score_percentage / a.best_cost_usd : 0;
      const vb = b.best_cost_usd ? b.best_score_percentage / b.best_cost_usd : 0;
      return vb - va;
    });
  } else {
    sorted.sort((a, b) => b.best_score_percentage - a.best_score_percentage);
  }
  return sorted;
}

type Props = {
  entries: LeaderboardEntry[];
  versions: BenchmarkVersion[];
};

// Icon components
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="3" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="1" y="6" width="12" height="2" rx="0.5" fill="currentColor" opacity="0.5"/>
      <rect x="1" y="10" width="12" height="2" rx="0.5" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

export default function LeaderboardFilters({ entries, versions: _versions }: Props) {
  const [tab,  setTab]  = useState<SortTab>("score");
  const [view, setView] = useState<ViewMode>("cards");

  const sorted = sortEntries(entries, tab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Controls row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Sort tabs */}
        <div style={{
          display: "flex",
          gap: 4,
          border: "1px solid var(--border)",
          borderRadius: 999,
          padding: 3,
          backgroundColor: "var(--bg-card)",
        }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: tab === t.id ? 600 : 400,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                transition: "background-color 150ms ease, color 150ms ease",
                backgroundColor: tab === t.id ? "var(--accent)" : "transparent",
                color: tab === t.id ? "var(--bg)" : "var(--text-muted)",
              }}
            >
              {tab === t.id && <span>+</span>}
              {t.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{
          display: "flex",
          gap: 3,
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: 3,
          backgroundColor: "var(--bg-card)",
        }}>
          {(["cards", "table"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={v === "cards" ? "Card view" : "Table view"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 28,
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                transition: "background-color 150ms ease, color 150ms ease",
                backgroundColor: view === v ? "rgba(0,236,151,0.12)" : "transparent",
                color: view === v ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {v === "cards" ? <GridIcon /> : <TableIcon />}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: "var(--text-muted)",
        letterSpacing: "0.05em",
      }}>
        {sorted.length} {sorted.length === 1 ? "MODEL" : "MODELS"} · SORTED BY{" "}
        <span style={{ color: "var(--accent)" }}>
          {TABS.find(t => t.id === tab)?.label.toUpperCase()}
        </span>
      </div>

      {/* Content */}
      {view === "cards" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
        }}>
          {sorted.map((entry, i) => (
            <GsapScrollReveal key={entry.best_submission_id}>
              <ModelCard entry={entry} rank={i + 1} sortTab={tab} />
            </GsapScrollReveal>
          ))}
        </div>
      ) : (
        <LeaderboardTable entries={sorted} />
      )}
    </div>
  );
}
