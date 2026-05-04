"use client";

export interface CrossBenchEntry {
  modelName: string;
  provider: string;
  ironclaw: {
    pass_rate: number;
    avg_score: number;
    cost?: number;
    time?: number;
  };
  pinchbench: {
    best_score: number;
    avg_score: number;
    cost?: number;
    time?: number;
    submission_count: number;
    model: string;
    provider: string | null;
  };
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          height: 3,
          borderRadius: 2,
          backgroundColor: "var(--border)",
          width: "100%",
        }}
      >
        <div
          style={{
            width: `${Math.min(value * 100, 100)}%`,
            height: "100%",
            borderRadius: 2,
            backgroundColor: color,
            transition: "width 600ms ease",
          }}
        />
      </div>
    </div>
  );
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtCost(n?: number) {
  if (!n) return "—";
  return `$${n.toFixed(4)}`;
}

function fmtTime(s?: number) {
  if (!s) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

const IRON_COLOR = "#e8a045";
const OPEN_COLOR = "#00ec97";

function Panel({
  label,
  color,
  scoreLabel,
  scoreValue,
  avgValue,
  costValue,
  timeValue,
  runsValue,
  isWinner,
}: {
  label: string;
  color: string;
  scoreLabel: string;
  scoreValue: number;
  avgValue: number;
  costValue?: number;
  timeValue?: number;
  runsValue?: number;
  isWinner: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "20px 24px",
        borderRadius: 8,
        border: `1px solid ${color}33`,
        backgroundColor: `${color}08`,
        position: "relative",
        minWidth: 0,
      }}
    >
      {isWinner && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color,
            border: `1px solid ${color}`,
            borderRadius: 3,
            padding: "2px 5px",
          }}
        >
          WINNER
        </span>
      )}

      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color,
          fontWeight: 600,
        }}
      >
        ◆ {label}
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            {scoreLabel}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color,
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {fmtPct(scoreValue)}
          </div>
          <ScoreBar value={scoreValue} color={color} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 16px",
          }}
        >
          <Stat label="Avg Score" value={fmtPct(avgValue)} />
          <Stat label="Cost" value={fmtCost(costValue)} />
          <Stat label="Time" value={fmtTime(timeValue)} />
          {runsValue !== undefined && (
            <Stat label="Runs" value={String(runsValue)} />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 8,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-data)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ModelCard({ entry }: { entry: CrossBenchEntry }) {
  const ironScore = entry.ironclaw.avg_score;
  const openScore = entry.pinchbench.best_score;
  const ironWins = ironScore > openScore;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        backgroundColor: "var(--bg-card)",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {entry.modelName}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {entry.provider}
          </span>
        </div>
      </div>

      {/* Two panels */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          alignItems: "stretch",
        }}
      >
        <Panel
          label="IronClaw"
          color={IRON_COLOR}
          scoreLabel="Pass Rate"
          scoreValue={entry.ironclaw.pass_rate}
          avgValue={entry.ironclaw.avg_score}
          costValue={entry.ironclaw.cost}
          timeValue={entry.ironclaw.time}
          isWinner={ironWins}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: 32,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            VS
          </span>
        </div>

        <Panel
          label="OpenClaw"
          color={OPEN_COLOR}
          scoreLabel="Best Score"
          scoreValue={entry.pinchbench.best_score}
          avgValue={entry.pinchbench.avg_score}
          costValue={entry.pinchbench.cost}
          timeValue={entry.pinchbench.time}
          runsValue={entry.pinchbench.submission_count}
          isWinner={!ironWins}
        />
      </div>
    </div>
  );
}

export default function CrossBenchSection({
  entries,
}: {
  entries: CrossBenchEntry[];
}) {
  if (entries.length === 0) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
            Cross-Benchmark
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: IRON_COLOR,
              border: `1px solid ${IRON_COLOR}`,
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            HEAD-TO-HEAD
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
          Models with runs in both IronClaw and OpenClaw benchmarks
        </p>
      </div>

      <div className="section-rule" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))",
          gap: 16,
        }}
      >
        {entries.map((e) => (
          <ModelCard key={`${e.modelName}-${e.provider}`} entry={e} />
        ))}
      </div>
    </section>
  );
}
