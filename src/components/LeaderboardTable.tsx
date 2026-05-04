import type { LeaderboardEntry } from "@/lib/types";

function fmt(n?: number, prefix = "", decimals = 2) {
  if (n === undefined || n === null) return "—";
  return `${prefix}${n.toFixed(decimals)}`;
}

function formatTime(s?: number) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

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

export default function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div style={{
      overflowX: "auto",
      border: "1px solid var(--border)",
      borderRadius: 8,
      backgroundColor: "var(--bg-card)",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ ...TH, width: 48 }}>◆ #</th>
            <th style={TH}>Model</th>
            <th style={TH}>Provider</th>
            <th style={TH}>Best Score</th>
            <th style={TH}>Avg Score</th>
            <th style={TH}>Cost</th>
            <th style={TH}>Time</th>
            <th style={{ ...TH, textAlign: "right" }}>Runs</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const scorePct = e.best_score_percentage * 100;
            const avgPct   = e.average_score_percentage * 100;
            const isTop    = i === 0;

            return (
              <tr
                key={e.best_submission_id}
                style={{
                  borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
                  backgroundColor: isTop ? "rgba(0,236,151,0.03)" : "transparent",
                  transition: "background-color 120ms ease",
                }}
                onMouseEnter={e2 => (e2.currentTarget.style.backgroundColor = "var(--bg-card-hover)")}
                onMouseLeave={e2 => (e2.currentTarget.style.backgroundColor = isTop ? "rgba(0,236,151,0.03)" : "transparent")}
              >
                {/* Rank */}
                <td style={{ ...TD, color: isTop ? "var(--accent)" : "var(--text-muted)", width: 48 }}>
                  {i + 1}
                </td>

                {/* Model */}
                <td style={{ ...TD, color: "var(--text)", fontWeight: 500, maxWidth: 200 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                    {e.model}
                  </span>
                </td>

                {/* Provider */}
                <td style={{ ...TD }}>
                  {e.provider
                    ? <span style={{
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {e.provider}
                      </span>
                    : "—"
                  }
                </td>

                {/* Best score with mini bar */}
                <td style={{ ...TD, color: isTop ? "var(--accent)" : "var(--text-data)", minWidth: 120 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontWeight: 600 }}>{scorePct.toFixed(1)}%</span>
                    <div style={{ height: 2, borderRadius: 1, backgroundColor: "var(--border)", width: 60 }}>
                      <div
                        className="score-bar"
                        style={{ width: `${scorePct}%`, height: "100%", borderRadius: 1 }}
                      />
                    </div>
                  </div>
                </td>

                {/* Avg score */}
                <td style={TD}>{avgPct.toFixed(1)}%</td>

                {/* Cost */}
                <td style={TD}>{fmt(e.best_cost_usd, "$")}</td>

                {/* Time */}
                <td style={TD}>{formatTime(e.best_execution_time_seconds)}</td>

                {/* Submissions */}
                <td style={{ ...TD, textAlign: "right" }}>{e.submission_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
