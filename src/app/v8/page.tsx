import MatrixMode from "@/components/v8/MatrixMode";
import { getIronclawLeaderboard } from "@/lib/api";
import { processLeaderboard } from "@/lib/benchUtils";

export default async function V8Page() {
  const data = await getIronclawLeaderboard();
  if (!data) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-mono)", color: "#94A3B8" }}>Failed to load benchmark data</p>
    </div>
  );
  return <MatrixMode models={processLeaderboard(data)} generatedAt={data.generated_at} />;
}
