import CircularGauge from "./CircularGauge";
import type { LeaderboardEntry, SortTab } from "@/lib/types";

function formatTime(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatCost(usd?: number) {
  if (usd === undefined || usd === null) return "—";
  return `$${usd.toFixed(usd < 0.01 ? 4 : 2)}`;
}

type Props = {
  entry: LeaderboardEntry;
  rank: number;
  sortTab: SortTab;
};

export default function ModelCard({ entry, rank, sortTab }: Props) {
  const scorePercent = entry.best_score_percentage * 100;
  const avgPercent = entry.average_score_percentage * 100;

  const highlightValue =
    sortTab === "speed"
      ? formatTime(entry.best_execution_time_seconds)
      : sortTab === "cost"
        ? formatCost(entry.best_cost_usd)
        : sortTab === "value"
          ? entry.best_cost_usd
            ? `${formatCost(entry.best_cost_usd)} / ${Math.round(scorePercent)}%`
            : "—"
          : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-mono">#{rank}</span>
        <span className="text-sm font-semibold text-white truncate">{entry.model}</span>
        {entry.provider && (
          <span className="ml-auto shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {entry.provider}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center py-2">
        <CircularGauge percentage={scorePercent} size={90} />
      </div>

      {highlightValue && (
        <div className="text-center text-xs text-orange-400 font-medium">{highlightValue}</div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-400">
        <span>Cost: <span className="text-zinc-200">{formatCost(entry.best_cost_usd)}</span></span>
        <span>Time: <span className="text-zinc-200">{formatTime(entry.best_execution_time_seconds)}</span></span>
        <span>Submissions: <span className="text-zinc-200">{entry.submission_count}</span></span>
        <span>Avg score: <span className="text-zinc-200">{avgPercent.toFixed(1)}%</span></span>
      </div>

      <div className="text-center text-xs text-zinc-600 font-mono truncate">
        {entry.best_submission_id}
      </div>
    </div>
  );
}
