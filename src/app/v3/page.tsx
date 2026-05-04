import ModelDuelCard from "@/components/v3/ModelDuelCard";
import { type CrossBenchEntry } from "@/components/CrossBenchSection";
import { getIronclawLeaderboard, getLeaderboard } from "@/lib/api";

function normalizeModel(name: string) {
  return name.split("/").pop()?.toLowerCase().replace(/[-._]/g, "") ?? "";
}

const IRON = "#FF8C00";
const OPEN = "#00EC97";
const BG = "#080808";
const MUTED = "#444444";
const BORDER = "#1E1E1E";

export default async function V3Page() {
  const [ironclaw, entries] = await Promise.all([
    getIronclawLeaderboard(),
    getLeaderboard({ limit: 100 }),
  ]);

  const crossEntries: CrossBenchEntry[] = [];
  if (ironclaw) {
    const modelMap = new Map(ironclaw.models.map((m) => [m.id, m]));
    const ironRuns = ironclaw.runs.filter((r) => r.framework_id === "ironclaw");
    for (const run of ironRuns) {
      const model = modelMap.get(run.model_id);
      if (!model) continue;
      const normIron = normalizeModel(model.name);
      const pbMatch = entries.find((e) => normalizeModel(e.model) === normIron);
      if (!pbMatch) continue;
      crossEntries.push({
        modelName: model.name,
        provider: model.provider,
        ironclaw: {
          pass_rate: run.pass_rate,
          avg_score: run.avg_score,
          cost: run.total_cost_usd,
          time: run.total_wall_time_ms / 1000,
        },
        pinchbench: {
          best_score: pbMatch.best_score_percentage,
          avg_score: pbMatch.average_score_percentage,
          cost: pbMatch.best_cost_usd ?? undefined,
          time: pbMatch.best_execution_time_seconds ?? undefined,
          submission_count: pbMatch.submission_count,
          model: pbMatch.model,
          provider: pbMatch.provider,
        },
      });
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BG,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: `${BG}E6`,
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${BORDER}`,
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              color: IRON,
              letterSpacing: "0.06em",
            }}
          >
            NEAR
          </span>
          <div style={{ width: 4, height: 4, backgroundColor: OPEN }} />
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 6,
              color: OPEN,
              letterSpacing: "0.1em",
            }}
          >
            AGENTBENCH
          </span>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 5,
              color: "#333",
              border: "1px solid #222",
              padding: "2px 5px",
              letterSpacing: "0.1em",
            }}
          >
            V3
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 5,
              color: MUTED,
              letterSpacing: "0.06em",
            }}
          >
            CROSS·BENCH
          </span>
          <div
            style={{
              display: "flex",
              gap: 3,
            }}
          >
            <div style={{ width: 8, height: 8, backgroundColor: IRON }} />
            <div style={{ width: 8, height: 8, backgroundColor: OPEN }} />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ padding: "56px 24px 40px", maxWidth: 900, margin: "0 auto" }}>
        {/* Top pixel accent row */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {[IRON, OPEN, IRON, OPEN, "#2979FF", OPEN].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, backgroundColor: c }} />
          ))}
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-pixel)",
            fontSize: "clamp(14px, 3vw, 22px)",
            color: "#FFFFFF",
            letterSpacing: "0.08em",
            lineHeight: 1.8,
            textTransform: "uppercase",
          }}
        >
          Cross·Bench
        </h1>

        <div
          style={{
            marginTop: 16,
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: MUTED,
            letterSpacing: "0.1em",
            lineHeight: 2.2,
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: IRON }}>■</span> IRONCLAW{" "}
          <span style={{ color: "#333", margin: "0 8px" }}>·</span>
          <span style={{ color: OPEN }}>■</span> OPENCLAW{" "}
          <span style={{ color: "#333", margin: "0 8px" }}>·</span>
          {crossEntries.length} MODEL{crossEntries.length !== 1 ? "S" : ""} IN COMMON
        </div>

        {/* Pixel ruler */}
        <div style={{ display: "flex", marginTop: 24, height: 6, overflow: "hidden" }}>
          {Array.from({ length: 120 }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor:
                  i % 8 < 4
                    ? i % 2 === 0
                      ? IRON
                      : `${IRON}55`
                    : i % 2 === 0
                    ? OPEN
                    : `${OPEN}55`,
              }}
            />
          ))}
        </div>
      </header>

      {/* Model cards */}
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {crossEntries.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              color: MUTED,
              letterSpacing: "0.1em",
            }}
          >
            NO_DATA
          </p>
        ) : (
          crossEntries.map((e) => (
            <ModelDuelCard key={`${e.modelName}-${e.provider}`} entry={e} />
          ))
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${BORDER}`,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 4, height: 4, backgroundColor: IRON }} />
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 6,
            color: "#2A2A2A",
            letterSpacing: "0.1em",
          }}
        >
          POWERED BY NEAR AI
        </span>
        <div style={{ width: 4, height: 4, backgroundColor: OPEN }} />
      </footer>
    </div>
  );
}
