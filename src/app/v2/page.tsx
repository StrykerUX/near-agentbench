import NavbarV2 from "@/components/v2/NavbarV2";
import HeroSectionV2 from "@/components/v2/HeroSectionV2";
import LeaderboardFiltersV2 from "@/components/v2/LeaderboardFiltersV2";
import {
  getBenchmarkVersions,
  getLeaderboard,
  getStats,
} from "@/lib/api";

export default async function V2Page() {
  const [versions, stats, entries] = await Promise.all([
    getBenchmarkVersions(),
    getStats(),
    getLeaderboard({ limit: 100 }),
  ]);

  const topScore = (entries[0]?.best_score_percentage ?? 0) * 100;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111111" }}>
      <NavbarV2 />
      <HeroSectionV2 topScore={topScore} stats={stats} />

      <main style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "48px 24px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}>
        {/* Section header */}
        <div style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          borderLeft: "4px solid #00EC97",
          paddingLeft: 16,
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: "var(--font-condensed)",
            fontSize: 40,
            color: "#FFFFFF",
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}>
            LEADERBOARD
          </h2>
          <span style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: "#444",
            letterSpacing: "0.1em",
          }}>
            NEAR AGENTBENCH · V2
          </span>
        </div>

        {/* Leaderboard */}
        {entries.length === 0 ? (
          <p style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 9,
            color: "#444",
            letterSpacing: "0.06em",
          }}>
            ▶ NO DATA AVAILABLE
          </p>
        ) : (
          <LeaderboardFiltersV2 entries={entries} versions={versions} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "2px solid #2A2A2A",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}>
        <span style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 6,
          color: "#333",
          letterSpacing: "0.1em",
        }}>
          POWERED BY NEAR
        </span>
        <div style={{ display: "flex", gap: 3 }}>
          {["#2979FF","#00EC97","#FFFFFF"].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, backgroundColor: c, opacity: i === 2 ? 0.2 : 0.7 }} />
          ))}
        </div>
      </footer>
    </div>
  );
}
