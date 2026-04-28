import type { GlobalStats } from "@/lib/types";

export default function StatsBar({ stats }: { stats: GlobalStats }) {
  return (
    <div className="flex gap-8 text-sm text-zinc-400">
      <span>
        <span className="font-semibold text-white">{stats.total_models}</span> models
      </span>
      <span>
        <span className="font-semibold text-white">{stats.total_submissions}</span> submissions
      </span>
      <span>
        <span className="font-semibold text-white">{stats.total_providers}</span> providers
      </span>
    </div>
  );
}
