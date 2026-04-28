import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import LeaderboardFilters from "@/components/LeaderboardFilters";
import { getBenchmarkVersions, getLeaderboard, getStats } from "@/lib/api";

export default async function HomePage() {
  const [entries, versions, stats] = await Promise.all([
    getLeaderboard({ limit: 50 }),
    getBenchmarkVersions(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <StatsBar stats={stats} />
        </div>
        {entries.length === 0 ? (
          <p className="text-zinc-500 text-sm">No hay datos disponibles en este momento.</p>
        ) : (
          <LeaderboardFilters entries={entries} versions={versions} />
        )}
      </main>
    </div>
  );
}
