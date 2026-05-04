import PixelGaugeV2 from "./PixelGaugeV2";
import type { LeaderboardEntry, SortTab } from "@/lib/types";

function formatTime(seconds?: number) {
  if (!seconds) return "—";
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function formatCost(usd?: number) {
  if (usd === undefined || usd === null) return "—";
  return `$${usd.toFixed(usd < 0.01 ? 4 : 2)}`;
}

const HL_BORDER: Record<SortTab, string> = {
  score: "#00EC97",
  speed: "#2979FF",
  cost:  "#FFB800",
  value: "#00EC97",
};

const HL_COLOR: Record<SortTab, string> = {
  score: "#00EC97",
  speed: "#2979FF",
  cost:  "#FFB800",
  value: "#00EC97",
};

type Props = {
  entry: LeaderboardEntry;
  rank: number;
  sortTab: SortTab;
};

export default function ModelCardV2({ entry, rank, sortTab }: Props) {
  const scorePercent = entry.best_score_percentage * 100;
  const avgPercent   = entry.average_score_percentage * 100;
  const borderColor  = HL_BORDER[sortTab];
  const hlColor      = HL_COLOR[sortTab];

  const highlightValue =
    sortTab === "speed" ? formatTime(entry.best_execution_time_seconds)
    : sortTab === "cost" ? formatCost(entry.best_cost_usd)
    : sortTab === "value" && entry.best_cost_usd
      ? `${formatCost(entry.best_cost_usd)} / ${scorePercent.toFixed(0)}%`
      : null;

  return (
    <div
      style={{
        backgroundColor: "#1A1A1A",
        border: "2px solid #2A2A2A",
        borderLeft: `4px solid ${borderColor}`,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        transition: "transform 80ms step-start, box-shadow 80ms step-start, border-color 80ms step-start",
        cursor: "default",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px, -2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `4px 4px 0 ${borderColor}33`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${borderColor}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "none";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A2A";
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = borderColor;
      }}
    >
      {/* Rank watermark */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 6,
          right: 10,
          fontFamily: "var(--font-condensed)",
          fontSize: 36,
          color: hlColor,
          opacity: 0.08,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        #{rank}
      </span>

      {/* Model + provider */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingRight: 40 }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 13,
          color: "#FFFFFF",
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
            fontSize: 8,
            color: "#555",
            border: "1px solid #2A2A2A",
            padding: "2px 7px",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}>
            {entry.provider}
          </span>
        )}
      </div>

      {/* Gauge */}
      <PixelGaugeV2 percentage={scorePercent} />

      {/* Highlight value */}
      {highlightValue && (
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: hlColor,
          fontWeight: 500,
        }}>
          {highlightValue}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "6px 12px",
      }}>
        {[
          { label: "COST", value: formatCost(entry.best_cost_usd) },
          { label: "TIME", value: formatTime(entry.best_execution_time_seconds) },
          { label: "AVG",  value: `${avgPercent.toFixed(1)}%` },
          { label: "RUNS", value: String(entry.submission_count) },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 6,
              color: "#444",
              letterSpacing: "0.1em",
            }}>
              {s.label}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#888",
            }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ID footer */}
      <div style={{
        borderTop: "1px solid #2A2A2A",
        paddingTop: 8,
        fontFamily: "var(--font-mono)",
        fontSize: 7,
        color: "#333",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        letterSpacing: "0.04em",
      }}>
        ▶ {entry.best_submission_id}
      </div>
    </div>
  );
}
