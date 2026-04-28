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

export type BenchmarkVersion = {
  id: string;
  semver: string | null;
  label: string;
  is_current?: boolean;
};

export type GlobalStats = {
  total_submissions: number;
  total_models: number;
  total_providers: number;
};

export type SortTab = "score" | "speed" | "cost" | "value";
export type ViewMode = "cards" | "table";
