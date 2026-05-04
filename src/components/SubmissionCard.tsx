import CircularGauge from "./CircularGauge";
import { detectClient } from "@/lib/types";
import type { Submission } from "@/lib/types";

function formatTime(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatCost(usd: number | null) {
  if (usd === null || usd === undefined) return "—";
  if (usd === 0) return "$0.0000";
  return `$${usd.toFixed(usd < 0.01 ? 4 : 2)}`;
}

const STAT_STYLE = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 2,
};

const LABEL_STYLE = {
  fontFamily: "var(--font-mono)",
  fontSize: 8,
  color: "var(--text-muted)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
};

const VALUE_STYLE = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text-data)",
  fontWeight: 500,
};

export default function SubmissionCard({ sub }: { sub: Submission }) {
  const client = detectClient(sub);
  const scorePercent = sub.score_percentage * 100;
  const avgScore = sub.max_score > 0 ? sub.total_score / sub.max_score : 0;
  const tasksLabel = `${sub.total_score % 1 === 0 ? sub.total_score : sub.total_score.toFixed(1)}/${sub.max_score}`;

  return (
    <div
      className="instrument-card"
      style={{ minWidth: 280, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
    >
      {/* Header: client badge + model info */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: 1,
          backgroundColor: client.color,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {client.name}
        </span>
      </div>

      {/* Gauge + stats row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <CircularGauge percentage={scorePercent} />

        {/* Stats grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px 16px",
          flex: 1,
        }}>
          <div style={STAT_STYLE}>
            <span style={LABEL_STYLE}>Cost</span>
            <span style={VALUE_STYLE}>{formatCost(sub.total_cost_usd)}</span>
          </div>
          <div style={STAT_STYLE}>
            <span style={LABEL_STYLE}>Time</span>
            <span style={VALUE_STYLE}>{formatTime(sub.total_execution_time_seconds)}</span>
          </div>
          <div style={STAT_STYLE}>
            <span style={LABEL_STYLE}>Tasks</span>
            <span style={VALUE_STYLE}>{tasksLabel}</span>
          </div>
          <div style={STAT_STYLE}>
            <span style={LABEL_STYLE}>Avg</span>
            <span style={VALUE_STYLE}>{avgScore.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Footer: submission ID */}
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
        + {sub.id}
      </div>
    </div>
  );
}
