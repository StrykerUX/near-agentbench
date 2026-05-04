import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ScoreWall, { type RawRun } from "@/components/ScoreWall";
import { getIronclawLeaderboard } from "@/lib/api";

export default async function V9Page() {
  const data = await getIronclawLeaderboard();

  if (!data) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-mono)", color: "#94A3B8" }}>Failed to load benchmark data</p>
    </div>
  );

  const modelMap = new Map(data.models.map((m) => [m.id, m]));
  const suiteMap = new Map(data.suites.map((s) => [s.id, s]));

  const runs: RawRun[] = data.runs
    .filter((r) => r.framework_id === "ironclaw" || r.framework_id === "openclaw")
    .map((run) => {
      const model = modelMap.get(run.model_id);
      const suite = suiteMap.get(run.suite_id);
      return {
        runId:      run.run_id,
        frameworkId: run.framework_id,
        modelName:  model?.name      ?? run.model_id,
        provider:   model?.provider  ?? "",
        suite:      suite?.name      ?? run.suite_id,
        dataset:    run.dataset,
        passRate:   run.pass_rate,
        avgScore:   run.avg_score,
        costUsd:    run.total_cost_usd,
        wallTimeMs: run.total_wall_time_ms,
        totalTasks: run.total_tasks,
        scoreSum:   run.avg_score * run.total_tasks,
        valueScore: run.value_score,
        isOfficial: run.is_official,
        tasks: (run.tasks ?? []).map((t) => ({
          taskId:    t.task_id,
          score:     t.score,
          label:     t.label,
          costUsd:   t.cost_usd,
          wallTimeMs: t.wall_time_ms,
          tokens:    t.tokens,
          error:     t.error,
        })),
      };
    });

  return (
    <>
      <Hero />
      <ScoreWall runs={runs} generatedAt={data.generated_at} />
      <Footer />
    </>
  );
}
