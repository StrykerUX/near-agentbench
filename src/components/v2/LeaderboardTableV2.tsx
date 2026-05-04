import type { LeaderboardEntry } from "@/lib/types";

function formatTime(s?: number) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

function fmt(n?: number, prefix = "", decimals = 2) {
  if (n === undefined || n === null) return "—";
  return `${prefix}${n.toFixed(decimals)}`;
}

const TH: React.CSSProperties = {
  padding: "10px 14px",
  fontFamily: "var(--font-pixel)",
  fontSize: 7,
  color: "#555",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: 400,
  textAlign: "left",
  whiteSpace: "nowrap",
  borderBottom: "2px solid #2A2A2A",
};

const TD: React.CSSProperties = {
  padding: "11px 14px",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "#888",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #1E1E1E",
};

export default function LeaderboardTableV2({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div style={{
      overflowX: "auto",
      border: "2px solid #2A2A2A",
      backgroundColor: "#1A1A1A",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#111" }}>
            <th style={{ ...TH, width: 40 }}># </th>
            <th style={TH}>MODEL</th>
            <th style={TH}>PROVIDER</th>
            <th style={TH}>BEST SCORE</th>
            <th style={TH}>AVG SCORE</th>
            <th style={TH}>COST</th>
            <th style={TH}>TIME</th>
            <th style={{ ...TH, textAlign: "right" }}>RUNS</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const score = e.best_score_percentage * 100;
            const avg   = e.average_score_percentage * 100;
            const isTop = i === 0;

            return (
              <tr
                key={e.best_submission_id}
                style={{
                  backgroundColor: isTop ? "rgba(0,236,151,0.04)" : "transparent",
                  transition: "background-color 80ms step-start",
                  cursor: "default",
                }}
                onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = "#222")}
                onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = isTop ? "rgba(0,236,151,0.04)" : "transparent")}
              >
                <td style={{ ...TD, color: isTop ? "#00EC97" : "#333", fontFamily: "var(--font-condensed)", fontSize: 16 }}>
                  {i + 1}
                </td>
                <td style={{ ...TD, color: "#FFF", fontWeight: 600, maxWidth: 200 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                    {e.model}
                  </span>
                </td>
                <td style={TD}>
                  {e.provider
                    ? <span style={{
                        border: "1px solid #2A2A2A",
                        padding: "1px 6px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 8,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#555",
                      }}>
                        {e.provider}
                      </span>
                    : "—"
                  }
                </td>
                <td style={{ ...TD, minWidth: 130 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ color: isTop ? "#00EC97" : "#BBB", fontWeight: 600 }}>
                      {score.toFixed(1)}%
                    </span>
                    {/* Mini pixel bar */}
                    <div style={{ display: "flex", gap: 1 }}>
                      {Array.from({ length: 10 }, (_, j) => (
                        <div
                          key={j}
                          style={{
                            width: 5,
                            height: 4,
                            backgroundColor: j < Math.round(score / 10)
                              ? (isTop ? "#00EC97" : "#2979FF")
                              : "rgba(255,255,255,0.06)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </td>
                <td style={TD}>{avg.toFixed(1)}%</td>
                <td style={TD}>{fmt(e.best_cost_usd, "$")}</td>
                <td style={TD}>{formatTime(e.best_execution_time_seconds)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{e.submission_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
