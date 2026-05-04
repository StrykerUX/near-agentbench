import type {
  BenchmarkVersion,
  GlobalStats,
  IronclawLeaderboard,
  LeaderboardEntry,
  ModelGroup,
  Submission,
  VersionGroup,
} from "./types";

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
  return Array.isArray(data) ? data : (data.leaderboard ?? []);
}

export async function getSubmissions(params?: {
  version?: string;
  sort?: "score" | "recent" | "oldest";
  limit?: number;
  offset?: number;
}): Promise<{ submissions: Submission[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.version) query.set("version", params.version);
  query.set("sort", params?.sort ?? "score");
  query.set("limit", String(params?.limit ?? 100));
  if (params?.offset) query.set("offset", String(params.offset));

  const res = await fetch(`${BASE}/api/submissions?${query}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { submissions: [], total: 0 };
  const data = await res.json();
  return {
    submissions: Array.isArray(data) ? data : (data.submissions ?? []),
    total: data.total ?? 0,
  };
}

// Groups submissions by benchmark_version, then by best per model+provider
export function groupSubmissionsByVersion(
  submissions: Submission[],
  versions: BenchmarkVersion[]
): VersionGroup[] {
  const versionMap = new Map(versions.map((v) => [v.id, v.label || v.semver || v.id]));

  // Group by benchmark_version
  const byVersion = new Map<string, Submission[]>();
  for (const sub of submissions) {
    const vId = sub.benchmark_version ?? "unknown";
    if (!byVersion.has(vId)) byVersion.set(vId, []);
    byVersion.get(vId)!.push(sub);
  }

  // For each version, keep best submission per (model, provider)
  const groups: VersionGroup[] = [];
  for (const [versionId, subs] of byVersion) {
    const bestByModel = new Map<string, Submission>();
    for (const sub of subs) {
      const key = `${sub.model}|||${sub.provider ?? ""}`;
      const existing = bestByModel.get(key);
      if (!existing || sub.score_percentage > existing.score_percentage) {
        bestByModel.set(key, sub);
      }
    }

    const modelGroups: ModelGroup[] = Array.from(bestByModel.values())
      .sort((a, b) => b.score_percentage - a.score_percentage)
      .map((sub) => ({
        model: sub.model,
        provider: sub.provider,
        submission: sub,
      }));

    groups.push({
      versionId,
      versionLabel: versionMap.get(versionId) ?? versionId,
      models: modelGroups,
    });
  }

  // Sort versions: named versions first, then by number of models desc
  return groups.sort((a, b) => {
    const aHasLabel = a.versionLabel !== a.versionId;
    const bHasLabel = b.versionLabel !== b.versionId;
    if (aHasLabel !== bHasLabel) return aHasLabel ? -1 : 1;
    return b.models.length - a.models.length;
  });
}

export async function getBenchmarkVersions(): Promise<BenchmarkVersion[]> {
  const res = await fetch(`${BASE}/api/benchmark_versions`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.versions ?? []);
}

const IRONCLAW_DATA_URL =
  "https://raw.githubusercontent.com/nearai/benchmarks/main/site/public/data/leaderboard.json";

export async function getIronclawLeaderboard(): Promise<IronclawLeaderboard | null> {
  try {
    const res = await fetch(IRONCLAW_DATA_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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
