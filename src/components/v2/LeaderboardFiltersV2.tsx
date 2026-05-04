"use client";

import { useState } from "react";
import ModelCardV2 from "./ModelCardV2";
import LeaderboardTableV2 from "./LeaderboardTableV2";
import GsapScrollReveal from "@/components/GsapScrollReveal";
import type { BenchmarkVersion, LeaderboardEntry, SortTab, ViewMode } from "@/lib/types";

const TABS: { id: SortTab; label: string; icon: string }[] = [
  { id: "score",  label: "SUCCESS",  icon: "▲" },
  { id: "speed",  label: "SPEED",    icon: "⚡" },
  { id: "cost",   label: "COST",     icon: "$"  },
  { id: "value",  label: "VALUE",    icon: "◆"  },
];

const TAB_COLOR: Record<SortTab, string> = {
  score: "#00EC97",
  speed: "#2979FF",
  cost:  "#FFB800",
  value: "#00EC97",
};

function sortEntries(entries: LeaderboardEntry[], tab: SortTab): LeaderboardEntry[] {
  const s = [...entries];
  if (tab === "speed") {
    s.sort((a, b) => (a.best_execution_time_seconds ?? Infinity) - (b.best_execution_time_seconds ?? Infinity));
  } else if (tab === "cost") {
    s.sort((a, b) => (a.best_cost_usd ?? Infinity) - (b.best_cost_usd ?? Infinity));
  } else if (tab === "value") {
    s.sort((a, b) => {
      const va = a.best_cost_usd ? a.best_score_percentage / a.best_cost_usd : 0;
      const vb = b.best_cost_usd ? b.best_score_percentage / b.best_cost_usd : 0;
      return vb - va;
    });
  } else {
    s.sort((a, b) => b.best_score_percentage - a.best_score_percentage);
  }
  return s;
}

type Props = {
  entries: LeaderboardEntry[];
  versions: BenchmarkVersion[];
};

export default function LeaderboardFiltersV2({ entries, versions: _versions }: Props) {
  const [tab,  setTab]  = useState<SortTab>("score");
  const [view, setView] = useState<ViewMode>("cards");
  const sorted = sortEntries(entries, tab);
  const hlColor = TAB_COLOR[tab];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 16px",
                border: `2px solid ${tab === t.id ? TAB_COLOR[t.id] : "#2A2A2A"}`,
                backgroundColor: tab === t.id ? `${TAB_COLOR[t.id]}18` : "#1A1A1A",
                fontFamily: "var(--font-pixel)",
                fontSize: 7,
                color: tab === t.id ? TAB_COLOR[t.id] : "#444",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "border-color 100ms, color 100ms, background-color 100ms",
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{ display: "flex", gap: 2 }}>
          {[
            { id: "cards" as ViewMode, label: "▦ CARDS" },
            { id: "table" as ViewMode, label: "≡ TABLE" },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: "6px 14px",
                border: `2px solid ${view === v.id ? hlColor : "#2A2A2A"}`,
                backgroundColor: view === v.id ? `${hlColor}18` : "#1A1A1A",
                fontFamily: "var(--font-pixel)",
                fontSize: 7,
                color: view === v.id ? hlColor : "#444",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "border-color 100ms, color 100ms, background-color 100ms",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section header rule */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          height: 2,
          width: 24,
          backgroundColor: hlColor,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 7,
          color: hlColor,
          letterSpacing: "0.1em",
        }}>
          {sorted.length} MODELS · SORTED BY {TABS.find(t => t.id === tab)?.label}
        </span>
        <div style={{
          flex: 1,
          height: 1,
          backgroundColor: "#2A2A2A",
        }} />
      </div>

      {/* Content */}
      {view === "cards" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 10,
        }}>
          {sorted.map((entry, i) => (
            <GsapScrollReveal key={entry.best_submission_id}>
              <ModelCardV2 entry={entry} rank={i + 1} sortTab={tab} />
            </GsapScrollReveal>
          ))}
        </div>
      ) : (
        <LeaderboardTableV2 entries={sorted} />
      )}
    </div>
  );
}
