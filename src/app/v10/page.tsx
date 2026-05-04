import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import HeroSection from "@/components/HeroSection";
import LeaderboardFilters from "@/components/LeaderboardFilters";
import IronclawSection from "@/components/IronclawSection";
import CrossBenchSection, { type CrossBenchEntry } from "@/components/CrossBenchSection";
import {
  getBenchmarkVersions,
  getIronclawLeaderboard,
  getLeaderboard,
  getStats,
} from "@/lib/api";

function normalizeModel(name: string) {
  return name.split("/").pop()?.toLowerCase().replace(/[-._]/g, "") ?? "";
}

export default async function HomePage() {
  const [versions, stats, entries, ironclaw] = await Promise.all([
    getBenchmarkVersions(),
    getStats(),
    getLeaderboard({ limit: 100 }),
    getIronclawLeaderboard(),
  ]);

  // Build cross-bench entries: IronClaw runs that also appear in PinchBench
  const crossEntries: CrossBenchEntry[] = [];
  if (ironclaw) {
    const modelMap = new Map(ironclaw.models.map((m) => [m.id, m]));
    const ironRuns = ironclaw.runs.filter((r) => r.framework_id === "ironclaw");
    for (const run of ironRuns) {
      const model = modelMap.get(run.model_id);
      if (!model) continue;
      const normIron = normalizeModel(model.name);
      const pbMatch = entries.find((e) => normalizeModel(e.model) === normIron);
      if (!pbMatch) continue;
      crossEntries.push({
        modelName: model.name,
        provider: model.provider,
        ironclaw: {
          pass_rate: run.pass_rate,
          avg_score: run.avg_score,
          cost: run.total_cost_usd,
          time: run.total_wall_time_ms / 1000,
        },
        pinchbench: {
          best_score: pbMatch.best_score_percentage,
          avg_score: pbMatch.average_score_percentage,
          cost: pbMatch.best_cost_usd ?? undefined,
          time: pbMatch.best_execution_time_seconds ?? undefined,
          submission_count: pbMatch.submission_count,
          model: pbMatch.model,
          provider: pbMatch.provider,
        },
      });
    }
  }

  const topScore = (entries[0]?.best_score_percentage ?? 0) * 100;
  const currentVersion = versions.find((v) => v.is_current) ?? versions[0];
  const versionLabel = currentVersion?.label ?? currentVersion?.semver ?? "";

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <HeroSection topScore={topScore} versionLabel={versionLabel} />

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 24px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Section header + stats */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}>
              Leaderboard
            </h2>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--text-muted)",
            }}>
              Ranked by benchmark performance across all submissions
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <StatsBar stats={stats} />

        {/* Section rule */}
        <div className="section-rule" />

        {/* Leaderboard with filters */}
        {entries.length === 0 ? (
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
          }}>
            + NO DATA AVAILABLE
          </p>
        ) : (
          <LeaderboardFilters entries={entries} versions={versions} />
        )}

        {/* Cross-benchmark head-to-head */}
        <div style={{ height: 32 }} />
        <CrossBenchSection entries={crossEntries} />

        {/* All IronClaw runs */}
        <div style={{ height: 16 }} />
        <IronclawSection data={ironclaw} />
      </main>
    </div>
  );
}
