"use client";

import { useState } from "react";
import ModelCard from "./ModelCard";
import LeaderboardTable from "./LeaderboardTable";
import type { BenchmarkVersion, LeaderboardEntry, SortTab, ViewMode } from "@/lib/types";

const TABS: { id: SortTab; label: string }[] = [
  { id: "score", label: "Success Rate" },
  { id: "speed", label: "Speed" },
  { id: "cost", label: "Cost" },
  { id: "value", label: "Value" },
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

export default function LeaderboardFilters({ entries, versions }: Props) {
  const [tab, setTab] = useState<SortTab>("score");
  const [view, setView] = useState<ViewMode>("cards");

  const sorted = sortEntries(entries, tab);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-zinc-800 overflow-hidden text-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 transition-colors ${
                tab === t.id
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {versions.length > 0 && (
            <select className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 focus:outline-none">
              <option value="">All Versions</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          )}

          <div className="flex rounded-lg border border-zinc-700 overflow-hidden text-sm">
            <button
              onClick={() => setView("cards")}
              className={`px-3 py-1.5 transition-colors ${
                view === "cards"
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 transition-colors ${
                view === "table"
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((entry, i) => (
            <ModelCard key={entry.best_submission_id} entry={entry} rank={i + 1} sortTab={tab} />
          ))}
        </div>
      ) : (
        <LeaderboardTable entries={sorted} />
      )}
    </div>
  );
}
