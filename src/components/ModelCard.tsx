import CircularGauge from "./CircularGauge";
import type { LeaderboardEntry, SortTab } from "@/lib/types";

function formatTime(seconds?: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatCost(usd?: number) {
  if (usd === undefined || usd === null) return "—";
  return `$${usd.toFixed(usd < 0.01 ? 4 : 2)}`;
}

const HIGHLIGHT_COLORS: Record<SortTab, string> = {
  score: "var(--accent)",
  speed: "var(--accent-blue)",
  cost:  "var(--warning)",
  value: "var(--accent)",
};

type Props = {
  entry: LeaderboardEntry;
  rank: number;
  sortTab: SortTab;
};

export default function ModelCard({ entry, rank, sortTab }: Props) {
  const scorePercent = entry.best_score_percentage * 100;
  const avgPercent   = entry.average_score_percentage * 100;
  const hlColor      = HIGHLIGHT_COLORS[sortTab];

  const highlightValue =
    sortTab === "speed"
      ? formatTime(entry.best_execution_time_seconds)
      : sortTab === "cost"
        ? formatCost(entry.best_cost_usd)
        : sortTab === "value" && entry.best_cost_usd
          ? `${formatCost(entry.best_cost_usd)} / ${scorePercent.toFixed(0)}%`
          : null;

  return (
    <div
      className="instrument-card"
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
        borderLeft: `3px solid ${hlColor}`,
      }}
    >
      {/* Rank watermark */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 8,
          right: 12,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 32,
          color: hlColor,
          opacity: 0.1,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        #{rank}
      </span>

      {/* Model name + provider */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingRight: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {entry.model}
          </span>
          {entry.provider && (
            <span style={{
              display: "inline-block",
              alignSelf: "flex-start",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "1px 8px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              {entry.provider}
            </span>
          )}
        </div>
      </div>

      {/* Gauge */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <CircularGauge percentage={scorePercent} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {/* Highlight value if non-score tab */}
          {highlightValue && (
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: hlColor,
              fontWeight: 500,
            }}>
              {highlightValue}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.07em" }}>COST</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-data)", marginLeft: "auto" }}>
                {formatCost(entry.best_cost_usd)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.07em" }}>TIME</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-data)", marginLeft: "auto" }}>
                {formatTime(entry.best_execution_time_seconds)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.07em" }}>AVG</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-data)", marginLeft: "auto" }}>
                {avgPercent.toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.07em" }}>RUNS</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-data)", marginLeft: "auto" }}>
                {entry.submission_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission ID footer */}
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 8,
        fontFamily: "var(--font-mono)",
        fontSize: 8,
        color: "var(--text-muted)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        letterSpacing: "0.04em",
      }}>
        + {entry.best_submission_id}
      </div>
    </div>
  );
}
