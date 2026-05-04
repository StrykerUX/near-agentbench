import ArenaView from "@/components/v7/ArenaView";
import { getIronclawLeaderboard } from "@/lib/api";
import { processLeaderboard } from "@/lib/benchUtils";

export default async function V7Page() {
  const data = await getIronclawLeaderboard();
  if (!data) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-mono)", color: "#8B949E" }}>Failed to load benchmark data</p>
    </div>
  );
  return <ArenaView models={processLeaderboard(data)} generatedAt={data.generated_at} />;
}
