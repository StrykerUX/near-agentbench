"use client";

import type { CrossBenchEntry } from "@/components/CrossBenchSection";

const IRON = "#FF8C00";
const OPEN = "#00EC97";
const BG_CARD = "#0D0D0D";
const BG_PANEL = "#111111";
const BORDER = "#2A2A2A";
const TEXT = "#FFFFFF";
const MUTED = "#555555";
const BLOCKS = 12;

function PixelBar({ ratio, color, reverse = false }: { ratio: number; color: string; reverse?: boolean }) {
  const filled = Math.round(Math.min(ratio, 1) * BLOCKS);
  const blocks = Array.from({ length: BLOCKS }, (_, i) => {
    const isFilled = reverse ? i >= BLOCKS - filled : i < filled;
    return isFilled;
  });
  return (
    <div style={{ display: "flex", gap: 3, flexDirection: reverse ? "row-reverse" : "row" }}>
      {blocks.map((on, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            backgroundColor: on ? color : "#1E1E1E",
            imageRendering: "pixelated",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function StatGrid({ items, align }: { items: [string, string][]; align: "left" | "right" }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px 12px",
        marginTop: 12,
      }}
    >
      {items.map(([label, value]) => (
        <div
          key={label}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: align === "right" ? "flex-end" : "flex-start",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 6,
              color: MUTED,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: TEXT,
              letterSpacing: "0.02em",
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function fmtPct(n: number) { return `${(n * 100).toFixed(1)}%`; }
function fmtCost(n?: number) { return n != null ? `$${n.toFixed(4)}` : "—"; }
function fmtTime(s?: number) {
  if (!s) return "—";
  return s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}m${Math.round(s % 60)}s`;
}

function CornerDot({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {[0, 1].map((row) => (
        <div key={row} style={{ display: "flex", gap: 2 }}>
          {[0, 1].map((col) => (
            <div key={col} style={{ width: 4, height: 4, backgroundColor: color }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PixelDivider() {
  const count = 14;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "0 12px",
        flexShrink: 0,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            backgroundColor: i < count / 2 ? `${IRON}99` : `${OPEN}99`,
          }}
        />
      ))}
    </div>
  );
}

export default function ModelDuelCard({ entry }: { entry: CrossBenchEntry }) {
  const ironWins = entry.ironclaw.avg_score > entry.pinchbench.best_score;

  return (
    <div
      style={{
        backgroundColor: BG_CARD,
        border: `1px solid ${BORDER}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top pixel ruler */}
      <div style={{ display: "flex", height: 4, overflow: "hidden" }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: i % 2 === 0 ? IRON : OPEN,
              opacity: i % 4 < 2 ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Card header */}
      <div
        style={{
          padding: "14px 20px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 9,
              color: TEXT,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {entry.modelName}
          </span>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 6,
              color: MUTED,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {entry.provider}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {ironWins && (
            <span
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 6,
                color: IRON,
                border: `1px solid ${IRON}`,
                padding: "3px 6px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              IRON ▲
            </span>
          )}
          {!ironWins && (
            <span
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 6,
                color: OPEN,
                border: `1px solid ${OPEN}`,
                padding: "3px 6px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              OPEN ▲
            </span>
          )}
        </div>
      </div>

      {/* Panels */}
      <div style={{ display: "flex", alignItems: "stretch", padding: 16, gap: 0 }}>
        {/* IronClaw panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: BG_PANEL,
            border: `1px solid ${IRON}22`,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CornerDot color={IRON} />
            <span
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 7,
                color: IRON,
                letterSpacing: "0.08em",
              }}
            >
              IRONCLAW
            </span>
          </div>

          <div style={{ marginTop: 4 }}>
            <div
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 6,
                color: MUTED,
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              PASS RATE
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontSize: 32,
                color: IRON,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {fmtPct(entry.ironclaw.pass_rate)}
            </div>
            <PixelBar ratio={entry.ironclaw.pass_rate} color={IRON} />
          </div>

          <StatGrid
            align="left"
            items={[
              ["Avg", fmtPct(entry.ironclaw.avg_score)],
              ["Cost", fmtCost(entry.ironclaw.cost)],
              ["Time", fmtTime(entry.ironclaw.time)],
            ]}
          />
        </div>

        <PixelDivider />

        {/* OpenClaw panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: BG_PANEL,
            border: `1px solid ${OPEN}22`,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 7,
                color: OPEN,
                letterSpacing: "0.08em",
              }}
            >
              OPENCLAW
            </span>
            <CornerDot color={OPEN} />
          </div>

          <div style={{ marginTop: 4 }}>
            <div
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 6,
                color: MUTED,
                letterSpacing: "0.06em",
                marginBottom: 6,
                textAlign: "right",
              }}
            >
              BEST SCORE
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontSize: 32,
                color: OPEN,
                lineHeight: 1,
                marginBottom: 8,
                textAlign: "right",
              }}
            >
              {fmtPct(entry.pinchbench.best_score)}
            </div>
            <PixelBar ratio={entry.pinchbench.best_score} color={OPEN} reverse />
          </div>

          <StatGrid
            align="right"
            items={[
              ["Avg", fmtPct(entry.pinchbench.avg_score)],
              ["Cost", fmtCost(entry.pinchbench.cost)],
              ["Runs", String(entry.pinchbench.submission_count)],
            ]}
          />
        </div>
      </div>

      {/* Bottom pixel ruler */}
      <div style={{ display: "flex", height: 4, overflow: "hidden" }}>
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: i % 2 === 0 ? OPEN : IRON,
              opacity: i % 4 < 2 ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
