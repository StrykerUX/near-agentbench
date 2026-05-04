import type { IronclawLeaderboard } from "./types";

export interface TaskResult {
  taskId: string;
  score: number;
  label: "pass" | "partial" | "fail" | "pending";
  costUsd: number;
  wallTimeMs: number;
  tokens: number;
  error: string | null;
}

export interface RunData {
  runId: string;
  frameworkId: string;
  modelName: string;
  provider: string;
  suite: string;
  passRate: number;
  avgScore: number;
  costUsd: number;
  wallTimeMs: number;
  totalTasks: number;
  scoreSum: number;
  valueScore: number;
  isOfficial: boolean;
  tasks: TaskResult[];
}

export interface ModelGroup {
  normalKey: string;
  displayName: string;
  provider: string;
  ironclaw?: RunData;
  openclaw?: RunData;
}

function normalizeModel(name: string) {
  return name.split("/").pop()?.toLowerCase().replace(/[-._]/g, "") ?? "";
}

export function processLeaderboard(data: IronclawLeaderboard): ModelGroup[] {
  const modelMap = new Map(data.models.map((m) => [m.id, m]));
  const suiteMap = new Map(data.suites.map((s) => [s.id, s]));
  const groupMap = new Map<string, ModelGroup>();

  for (const run of data.runs) {
    const model = modelMap.get(run.model_id);
    const suite = suiteMap.get(run.suite_id);
    if (!model) continue;
    if (run.framework_id !== "ironclaw" && run.framework_id !== "openclaw") continue;

    const key = normalizeModel(model.name);
    if (!groupMap.has(key)) {
      groupMap.set(key, { normalKey: key, displayName: model.name, provider: model.provider });
    }

    const group = groupMap.get(key)!;
    if (run.framework_id === "ironclaw") {
      group.displayName = model.name;
      group.provider = model.provider;
    }

    const runData: RunData = {
      runId: run.run_id,
      frameworkId: run.framework_id,
      modelName: model.name,
      provider: model.provider,
      suite: suite?.name ?? run.suite_id,
      passRate: run.pass_rate,
      avgScore: run.avg_score,
      costUsd: run.total_cost_usd,
      wallTimeMs: run.total_wall_time_ms,
      totalTasks: run.total_tasks,
      scoreSum: run.avg_score * run.total_tasks,
      valueScore: run.value_score,
      isOfficial: run.is_official,
      tasks: (run.tasks ?? []).map((t) => ({
        taskId: t.task_id,
        score: t.score,
        label: t.label,
        costUsd: t.cost_usd,
        wallTimeMs: t.wall_time_ms,
        tokens: t.tokens,
        error: t.error,
      })),
    };

    if (run.framework_id === "ironclaw") group.ironclaw = runData;
    else group.openclaw = runData;
  }

  return Array.from(groupMap.values()).sort((a, b) => {
    const aBoth = a.ironclaw && a.openclaw ? 1 : 0;
    const bBoth = b.ironclaw && b.openclaw ? 1 : 0;
    if (bBoth !== aBoth) return bBoth - aBoth;
    return (b.ironclaw?.passRate ?? 0) - (a.ironclaw?.passRate ?? 0);
  });
}

export function fmtCost(usd: number) { return `$${usd.toFixed(4)}`; }
export function fmtTime(ms: number) {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}
export function shortTaskId(id: string) {
  const parts = id.split(/[_-]/);
  if (parts.length <= 2) return id.slice(0, 10);
  return parts.slice(2).join("_").slice(0, 12);
}
