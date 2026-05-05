import Hero from "@/components/Hero";
import ScoreWall, { type RawRun } from "@/components/ScoreWall";
import { getIronclawLeaderboard, getLeaderboard } from "@/lib/api";

function normalizeModel(modelId: string) {
  return modelId.split("/").pop()?.toLowerCase().replace(/[-._]/g, "") ?? "";
}

export default async function V9Page() {
  const [ironclawData, pinchbenchEntries] = await Promise.all([
    getIronclawLeaderboard(),
    getLeaderboard({ limit: 200 }),
  ]);

  if (!ironclawData) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-mono)", color: "#94A3B8" }}>Failed to load benchmark data</p>
    </div>
  );

  const modelMap = new Map(ironclawData.models.map((m) => [m.id, m]));
  const suiteMap = new Map(ironclawData.suites.map((s) => [s.id, s]));

  // Build set of normalized model keys from IronClaw runs
  const ironclawModelKeys = new Set(
    ironclawData.runs
      .filter((r) => r.framework_id === "ironclaw")
      .map((r) => normalizeModel(r.model_id))
  );

  // IronClaw runs only (drop the JSON's openclaw — replaced by PinchBench below)
  const ironclawRuns: RawRun[] = ironclawData.runs
    .filter((r) => r.framework_id === "ironclaw")
    .map((run) => {
      const model = modelMap.get(run.model_id);
      const suite = suiteMap.get(run.suite_id);
      return {
        runId:       run.run_id,
        frameworkId: "ironclaw",
        modelName:   model?.name     ?? run.model_id,
        provider:    model?.provider ?? "",
        suite:       suite?.name     ?? run.suite_id,
        dataset:     run.dataset,
        passRate:    run.pass_rate,
        avgScore:    run.avg_score,
        costUsd:     run.total_cost_usd,
        wallTimeMs:  run.total_wall_time_ms,
        totalTasks:  run.total_tasks,
        scoreSum:    run.avg_score * run.total_tasks,
        valueScore:  run.value_score,
        isOfficial:  run.is_official,
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

  // PinchBench runs — best entry per IronClaw model (highest score, prefer non-zero cost)
  const PINCHBENCH_TASKS = 53;
  const bestByModel = new Map<string, typeof pinchbenchEntries[0]>();
  for (const entry of pinchbenchEntries) {
    const key = normalizeModel(entry.model);
    if (!ironclawModelKeys.has(key)) continue;
    const existing = bestByModel.get(key);
    if (!existing) { bestByModel.set(key, entry); continue; }
    const entryCost    = entry.best_cost_usd    ?? 0;
    const existingCost = existing.best_cost_usd ?? 0;
    const entryHasCost    = entryCost > 0;
    const existingHasCost = existingCost > 0;
    // Prefer entries with real cost data; among those, pick highest score
    if (entryHasCost && !existingHasCost) { bestByModel.set(key, entry); continue; }
    if (!entryHasCost && existingHasCost) continue;
    if (entry.best_score_percentage > existing.best_score_percentage) bestByModel.set(key, entry);
  }

  const pinchbenchRuns: RawRun[] = Array.from(bestByModel.values()).map((entry) => {
      const costUsd     = entry.best_cost_usd     ?? 0;
      const wallTimeMs  = (entry.best_execution_time_seconds ?? 0) * 1000;
      const passRate    = entry.best_score_percentage;
      const valueScore  = (passRate * 1000) / Math.max(costUsd, 0.01);
      const modelParts  = entry.model.split("/");
      const modelName   = modelParts.slice(1).join("/") || entry.model;
      const provider    = entry.provider ?? modelParts[0] ?? "";
      return {
        runId:       entry.best_submission_id,
        frameworkId: "openclaw",
        modelName,
        provider,
        suite:       "PinchBench",
        dataset:     "pinchbench/v1",
        passRate,
        avgScore:    entry.average_score_percentage,
        costUsd,
        wallTimeMs,
        totalTasks:  PINCHBENCH_TASKS,
        scoreSum:    passRate * PINCHBENCH_TASKS,
        valueScore,
        isOfficial:  false,
        tasks:       [],
      };
    });

  const runs: RawRun[] = [...ironclawRuns, ...pinchbenchRuns];

  return (
    <>
      <Hero />
      <ScoreWall runs={runs} generatedAt={ironclawData.generated_at} />
    </>
  );
}
