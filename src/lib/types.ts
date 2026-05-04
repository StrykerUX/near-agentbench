export type LeaderboardEntry = {
  model: string;
  provider: string | null;
  best_score_percentage: number;
  average_score_percentage: number;
  submission_count: number;
  latest_submission: string;
  best_submission_id: string;
  average_execution_time_seconds?: number;
  best_execution_time_seconds?: number;
  average_cost_usd?: number;
  best_cost_usd?: number;
};

export type Submission = {
  id: string;
  model: string;
  provider: string | null;
  score_percentage: number;
  total_score: number;
  max_score: number;
  total_execution_time_seconds: number | null;
  total_cost_usd: number | null;
  timestamp: string;
  created_at: string;
  client_version: string | null;
  openclaw_version: string | null;
  benchmark_version: string | null;
  official: number;
  claimed: number;
  github_username?: string | null;
  weights?: string;
  hf_link?: string | null;
};

export type BenchmarkVersion = {
  id: string;
  semver: string | null;
  label: string;
  is_current?: boolean;
  submission_count?: number;
};

export type GlobalStats = {
  total_submissions: number;
  total_models: number;
  total_providers: number;
};

export type SortTab = "score" | "speed" | "cost" | "value";
export type ViewMode = "cards" | "table";

export type ClientInfo = {
  name: string;
  color: string;
};

export function detectClient(sub: Submission): ClientInfo {
  const ocv = (sub.openclaw_version ?? "").toLowerCase();
  const cv = (sub.client_version ?? "").toLowerCase();

  if (ocv.startsWith("ironclaw") || cv.startsWith("ironclaw") || cv.includes("iron")) {
    return { name: "IronClaw", color: "#e8a045" };
  }
  if (ocv.startsWith("openclaw") || cv.startsWith("openclaw")) {
    return { name: "OpenClaw", color: "#7ec8b0" };
  }
  // Fallback: show raw version or "Unknown"
  const label = sub.openclaw_version || sub.client_version || "Unknown";
  return { name: label, color: "#6b7280" };
}

// ── IronClaw (nearai/benchmarks) types ──────────────────────────────────────

export interface IronclawFramework {
  id: string;
  name: string;
  url?: string;
  versions?: string[];
}

export interface IronclawModel {
  id: string;
  name: string;
  provider: string;
}

export interface IronclawTask {
  task_id: string;
  score: number;
  label: "pass" | "partial" | "fail" | "pending";
  cost_usd: number;
  wall_time_ms: number;
  tokens: number;
  turns: number;
  error: string | null;
}

export interface IronclawRun {
  run_id: string;
  framework_id: string;
  framework_version?: string;
  model_id: string;
  suite_id: string;
  dataset: string;
  pass_rate: number;
  avg_score: number;
  total_cost_usd: number;
  total_wall_time_ms: number;
  value_score: number;
  total_tasks: number;
  completed_tasks: number;
  started_at?: string;
  finished_at?: string;
  is_official: boolean;
  tasks?: IronclawTask[];
}

export interface IronclawSuite {
  id: string;
  name: string;
  task_count: number;
  description?: string;
}

export interface IronclawLeaderboard {
  generated_at: string;
  frameworks: IronclawFramework[];
  models: IronclawModel[];
  suites: IronclawSuite[];
  datasets: string[];
  runs: IronclawRun[];
}

// Groups submissions by benchmark_version → model+provider
export type VersionGroup = {
  versionId: string;
  versionLabel: string;
  models: ModelGroup[];
};

export type ModelGroup = {
  model: string;
  provider: string | null;
  submission: Submission; // best submission for this model+provider in this version
};
