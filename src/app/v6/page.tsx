import SignalCards from "@/components/v6/SignalCards";
import { getIronclawLeaderboard } from "@/lib/api";
import { processLeaderboard } from "@/lib/benchUtils";

export default async function V6Page() {
  const data = await getIronclawLeaderboard();
  if (!data) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-mono)", color: "#94A3B8" }}>Failed to load benchmark data</p>
    </div>
  );
  return <SignalCards models={processLeaderboard(data)} generatedAt={data.generated_at} />;
}
