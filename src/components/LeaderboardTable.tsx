import type { LeaderboardEntry } from "@/lib/types";

function fmt(n?: number, prefix = "", decimals = 2) {
  if (n === undefined || n === null) return "—";
  return `${prefix}${n.toFixed(decimals)}`;
}

function formatTime(s?: number) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

export default function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Best Score</th>
            <th className="px-4 py-3">Avg Score</th>
            <th className="px-4 py-3">Cost</th>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Submissions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {entries.map((e, i) => (
            <tr key={e.best_submission_id} className="bg-zinc-950 hover:bg-zinc-900 transition-colors">
              <td className="px-4 py-3 text-zinc-500 font-mono">{i + 1}</td>
              <td className="px-4 py-3 text-white font-medium">{e.model}</td>
              <td className="px-4 py-3 text-zinc-400">{e.provider ?? "—"}</td>
              <td className="px-4 py-3 text-orange-400 font-semibold">
                {(e.best_score_percentage * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-zinc-300">
                {(e.average_score_percentage * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-zinc-300">{fmt(e.best_cost_usd, "$")}</td>
              <td className="px-4 py-3 text-zinc-300">{formatTime(e.best_execution_time_seconds)}</td>
              <td className="px-4 py-3 text-zinc-300">{e.submission_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
