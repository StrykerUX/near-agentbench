"use client";

import type { IronclawLeaderboard, IronclawRun } from "@/lib/types";

const TH: React.CSSProperties = {
  padding: "10px 16px",
  fontFamily: "var(--font-mono)",
  fontSize: 9,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: 400,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "12px 16px",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text-data)",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

function fmtPct(n?: number) {
  if (n === undefined || n === null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function fmtCost(n?: number) {
  if (n === undefined || n === null) return "—";
  return `$${n.toFixed(4)}`;
}

function fmtTime(s?: number) {
  if (!s) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface NormalizedRun {
  run: IronclawRun;
  model_name: string;
  provider: string;
  framework_name: string;
  suite_name: string;
}

export default function IronclawSection({
  data,
}: {
  data: IronclawLeaderboard | null;
}) {
  if (!data) {
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionHeader generatedAt={null} runCount={0} />
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          + NO IRONCLAW DATA AVAILABLE
        </p>
      </section>
    );
  }

  const { frameworks, models, suites, runs, generated_at } = data;

  const normalized: NormalizedRun[] = runs
    .map((run) => ({
      run,
      model_name: models.find((m) => m.id === run.model_id)?.name ?? run.model_id,
      provider: models.find((m) => m.id === run.model_id)?.provider ?? "—",
      framework_name:
        frameworks.find((f) => f.id === run.framework_id)?.name ?? run.framework_id,
      suite_name: suites.find((s) => s.id === run.suite_id)?.id ?? run.suite_id,
    }))
    .sort((a, b) => b.run.avg_score - a.run.avg_score);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader generatedAt={generated_at} runCount={runs.length} />

      <div className="section-rule" />

      <div
        style={{
          overflowX: "auto",
          border: "1px solid var(--border)",
          borderRadius: 8,
          backgroundColor: "var(--bg-card)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ ...TH, width: 48 }}>◆ #</th>
              <th style={TH}>Model</th>
              <th style={TH}>Provider</th>
              <th style={TH}>Framework</th>
              <th style={TH}>Suite</th>
              <th style={TH}>Pass Rate</th>
              <th style={TH}>Avg Score</th>
              <th style={TH}>Cost</th>
              <th style={{ ...TH, textAlign: "right" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {normalized.map(({ run, model_name, provider, framework_name, suite_name }, i) => {
              const isTop = i === 0;
              return (
                <tr
                  key={run.run_id}
                  style={{
                    borderBottom: i < normalized.length - 1 ? "1px solid var(--border)" : "none",
                    backgroundColor: isTop ? "rgba(0,236,151,0.03)" : "transparent",
                    transition: "background-color 120ms ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--bg-card-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = isTop
                      ? "rgba(0,236,151,0.03)"
                      : "transparent")
                  }
                >
                  <td style={{ ...TD, color: isTop ? "var(--accent)" : "var(--text-muted)", width: 48 }}>
                    {i + 1}
                  </td>

                  <td style={{ ...TD, color: "var(--text)", fontWeight: 500, maxWidth: 220 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                      {model_name}
                    </span>
                  </td>

                  <td style={TD}>
                    <span
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {provider}
                    </span>
                  </td>

                  <td style={{ ...TD, color: "#e8a045" }}>{framework_name}</td>

                  <td style={TD}>{suite_name}</td>

                  <td style={{ ...TD, color: isTop ? "var(--accent)" : "var(--text-data)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontWeight: 600 }}>{fmtPct(run.pass_rate)}</span>
                      <div
                        style={{
                          height: 2,
                          borderRadius: 1,
                          backgroundColor: "var(--border)",
                          width: 60,
                        }}
                      >
                        <div
                          className="score-bar"
                          style={{
                            width: `${(run.pass_rate ?? 0) * 100}%`,
                            height: "100%",
                            borderRadius: 1,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td style={TD}>{fmtPct(run.avg_score)}</td>

                  <td style={TD}>{fmtCost(run.total_cost_usd)}</td>

                  <td style={{ ...TD, textAlign: "right" }}>
                    {fmtTime(run.total_wall_time_ms / 1000)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SectionHeader({
  generatedAt,
  runCount,
}: {
  generatedAt: string | null;
  runCount: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            IronClaw Benchmarks
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#e8a045",
              border: "1px solid #e8a045",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            IRONCLAW
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          {runCount > 0
            ? `${runCount} benchmark run${runCount !== 1 ? "s" : ""} from nearai/benchmarks`
            : "No runs available"}
          {generatedAt && (
            <> &middot; updated {fmtDate(generatedAt)}</>
          )}
        </p>
      </div>
    </div>
  );
}
