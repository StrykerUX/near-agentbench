import type { BenchmarkVersion, GlobalStats, LeaderboardEntry } from "./types";

const BASE = "https://api.pinchbench.com";

export async function getLeaderboard(params?: {
  version?: string;
  verified?: boolean;
  limit?: number;
}): Promise<LeaderboardEntry[]> {
  const query = new URLSearchParams();
  if (params?.version) query.set("version", params.version);
  if (params?.verified) query.set("verified", "true");
  query.set("limit", String(params?.limit ?? 50));

  const res = await fetch(`${BASE}/api/leaderboard?${query}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  // API returns { leaderboard: [...] }
  return Array.isArray(data) ? data : (data.leaderboard ?? []);
}

export async function getBenchmarkVersions(): Promise<BenchmarkVersion[]> {
  const res = await fetch(`${BASE}/api/benchmark_versions`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  // API returns { versions: [...] }
  return Array.isArray(data) ? data : (data.versions ?? []);
}

export async function getStats(): Promise<GlobalStats> {
  const res = await fetch(`${BASE}/api/stats`, { next: { revalidate: 60 } });
  if (!res.ok) return { total_submissions: 0, total_models: 0, total_providers: 0 };
  const data = await res.json();
  return {
    total_submissions: data.total_submissions ?? 0,
    total_models: data.total_models ?? 0,
    total_providers: data.total_providers ?? 0,
  };
}
