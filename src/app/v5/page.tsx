import CrossBenchDashboard, {
  type ModelCrossBench,
  type RunInfo,
} from "@/components/v5/CrossBenchDashboard";
import { getIronclawLeaderboard } from "@/lib/api";

function normalizeModel(name: string) {
  return name.split("/").pop()?.toLowerCase().replace(/[-._]/g, "") ?? "";
}

export default async function V5Page() {
  const ironclaw = await getIronclawLeaderboard();

  if (!ironclaw) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#EEF2FF",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{ fontFamily: "var(--font-mono)", color: "#6B7280", fontSize: 14 }}>
          Failed to load benchmark data
        </p>
      </div>
    );
  }

  const modelMap = new Map(ironclaw.models.map((m) => [m.id, m]));
  const suiteMap = new Map(ironclaw.suites.map((s) => [s.id, s]));

  // Build cross-bench map: normalKey → { displayName, provider, ironclaw?, openclaw? }
  const crossMap = new Map<string, ModelCrossBench>();

  for (const run of ironclaw.runs) {
    const model = modelMap.get(run.model_id);
    const suite = suiteMap.get(run.suite_id);
    if (!model) continue;

    const key         = normalizeModel(model.name);
    const frameworkId = run.framework_id;

    // Only care about ironclaw and openclaw
    if (frameworkId !== "ironclaw" && frameworkId !== "openclaw") continue;

    if (!crossMap.has(key)) {
      crossMap.set(key, {
        normalKey:   key,
        // IronClaw's model names are cleaner (e.g. "claude-sonnet-4.6" vs "anthropic/claude-sonnet-4-6")
        displayName: frameworkId === "ironclaw" ? model.name : model.name.split("/").pop() ?? model.name,
        provider:    frameworkId === "ironclaw" ? model.provider : model.provider,
      });
    }

    const entry = crossMap.get(key)!;

    // Prefer IronClaw's clean display name when available
    if (frameworkId === "ironclaw") {
      entry.displayName = model.name;
      entry.provider    = model.provider;
    }

    const runInfo: RunInfo = {
      runId:      run.run_id,
      passRate:   run.pass_rate,
      avgScore:   run.avg_score,
      costUsd:    run.total_cost_usd,
      wallTimeMs: run.total_wall_time_ms,
      totalTasks: run.total_tasks,
      scoreSum:   run.avg_score * run.total_tasks,
      valueScore: run.value_score,
      suite:      suite?.name ?? run.suite_id,
      isOfficial: run.is_official,
    };

    if (frameworkId === "ironclaw") entry.ironclaw = runInfo;
    if (frameworkId === "openclaw") entry.openclaw = runInfo;
  }

  // Sort: models with BOTH frameworks first, then iron-only, then open-only
  const models = Array.from(crossMap.values()).sort((a, b) => {
    const aBoth = a.ironclaw && a.openclaw ? 1 : 0;
    const bBoth = b.ironclaw && b.openclaw ? 1 : 0;
    if (bBoth !== aBoth) return bBoth - aBoth;
    return (b.ironclaw?.passRate ?? 0) - (a.ironclaw?.passRate ?? 0);
  });

  return (
    <CrossBenchDashboard
      models={models}
      generatedAt={ironclaw.generated_at}
    />
  );
}
