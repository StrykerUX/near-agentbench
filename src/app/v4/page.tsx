import BenchDashboard, { type RunData } from "@/components/v4/BenchDashboard";
import { getIronclawLeaderboard } from "@/lib/api";

export default async function V4Page() {
  const ironclaw = await getIronclawLeaderboard();

  if (!ironclaw) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", color: "#555", fontSize: 14 }}>
          Failed to load benchmark data
        </p>
      </div>
    );
  }

  const modelMap     = new Map(ironclaw.models.map(m => [m.id, m]));
  const frameworkMap = new Map(ironclaw.frameworks.map(f => [f.id, f]));
  const suiteMap     = new Map(ironclaw.suites.map(s => [s.id, s]));

  const runs: RunData[] = ironclaw.runs.map(run => {
    const model     = modelMap.get(run.model_id);
    const suite     = suiteMap.get(run.suite_id);

    return {
      runId:          run.run_id,
      frameworkId:    run.framework_id,
      modelId:        run.model_id,
      modelName:      model?.name      ?? run.model_id,
      provider:       model?.provider  ?? "",
      suiteId:        run.suite_id,
      suiteName:      suite?.name      ?? run.suite_id,
      dataset:        run.dataset,
      passRate:       run.pass_rate,
      avgScore:       run.avg_score,
      costUsd:        run.total_cost_usd,
      wallTimeMs:     run.total_wall_time_ms,
      totalTasks:     run.total_tasks,
      completedTasks: run.completed_tasks,
      scoreSum:       run.avg_score * run.total_tasks,
      valueScore:     run.value_score,
      isOfficial:     run.is_official,
      tasks:          run.tasks,
    };
  });

  // Derive unique filter options from actual data
  const suiteOptions     = [...new Set(runs.map(r => r.suiteId))];
  const datasetOptions   = [...new Set(runs.map(r => r.dataset))];
  const modelOptions     = [...new Set(runs.map(r => r.modelId))];
  const frameworkOptions = [...new Set(runs.map(r => r.frameworkId))];

  return (
    <BenchDashboard
      runs={runs}
      suiteOptions={suiteOptions}
      datasetOptions={datasetOptions}
      modelOptions={modelOptions}
      frameworkOptions={frameworkOptions}
      generatedAt={ironclaw.generated_at}
    />
  );
}
