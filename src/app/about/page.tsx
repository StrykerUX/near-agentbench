const ORANGE = "#E8801A";
const GREEN  = "#00EC97";
const BG     = "#000000";
const CARD   = "#111111";
const BORDER = "#1E1E1E";
const TEXT   = "#FFFFFF";
const MUTED  = "#888888";

const metrics = [
  {
    name: "Pass Rate",
    desc: "Percentage of tasks scored ≥1.0 (binary pass/fail).",
    color: GREEN,
  },
  {
    name: "Avg Score",
    desc: "Mean score across all tasks (0.0–1.0).",
    color: GREEN,
  },
  {
    name: "Cost",
    desc: "Total estimated LLM API cost in USD.",
    color: ORANGE,
  },
  {
    name: "Time",
    desc: "Total wall-clock execution time.",
    color: ORANGE,
  },
  {
    name: "Value Score",
    desc: "Derived metric: (pass_rate × 1000) / max(cost, $0.001). Higher is better. Rewards high accuracy at low cost.",
    color: "#2979FF",
  },
];

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: BG, color: TEXT, fontFamily: "var(--font-sans)" }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "80px 40px 64px",
        }}>
          <p style={{ margin: "0 0 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: ORANGE, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Documentation
          </p>
          <h1 style={{
            margin: "0 0 20px",
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: "clamp(36px, 5vw, 56px)",
            letterSpacing: "-0.03em", lineHeight: 1.05, color: TEXT,
          }}>
            About Claw Bench
          </h1>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, color: MUTED, lineHeight: 1.65, maxWidth: 600 }}>
            A multi-framework benchmarking platform for AI coding agents, providing
            apples-to-apples comparison of agent capabilities across frameworks and models.
          </p>
        </section>

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 40px 120px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* ── Overview ───────────────────────────────────────────────────── */}
          <Section title="Overview">
            <p style={BODY}>
              Claw Bench compares frameworks like IronClaw, OpenClaw, and NanoBot across the same
              tasks and models. Every framework runs through the same benchmark suites with identical
              task definitions and scoring criteria, so the results reflect the framework, not the
              test conditions.
            </p>
          </Section>

          {/* ── Methodology ────────────────────────────────────────────────── */}
          <Section title="Methodology">
            <p style={BODY}>
              Each framework runs through the same benchmark suites — Spot Checks, Trajectory,
              SWE-Bench, and others — with identical task definitions and scoring criteria.
              Results capture pass rate, average score, cost, and wall-clock time per run.
            </p>
            <div style={{ marginTop: 20, padding: "16px 20px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: "#666", lineHeight: 1.7 }}>
                <span style={{ color: ORANGE }}>Spot Checks</span> · <span style={{ color: ORANGE }}>Trajectory</span> · <span style={{ color: ORANGE }}>SWE-Bench</span> · and more
              </p>
            </div>
          </Section>

          {/* ── Metrics ────────────────────────────────────────────────────── */}
          <Section title="Metrics">
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {metrics.map((m) => (
                <div key={m.name} style={{
                  display: "grid", gridTemplateColumns: "160px 1fr",
                  gap: 24, padding: "16px 0",
                  borderBottom: `1px solid ${BORDER}`,
                  alignItems: "start",
                }}>
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
                    color: m.color,
                  }}>
                    {m.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "#B0B8C8", lineHeight: 1.6 }}>
                    {m.desc}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Scoring ────────────────────────────────────────────────────── */}
          <Section title="Scoring">
            <p style={BODY}>
              Tasks are scored using a centralized scoring system that evaluates agent responses
              against predefined assertions: exact match, regex, contains, tool usage, and others.
              Scoring is applied uniformly regardless of which framework produced the response.
            </p>
          </Section>

          {/* ── Contributing ───────────────────────────────────────────────── */}
          <Section title="Contributing">
            <p style={BODY}>
              To submit results for a new framework, implement a harness that outputs the standard
              format with the required framework metadata fields.
            </p>
            <div style={{ marginTop: 20, padding: "16px 20px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: "#666", lineHeight: 1.7 }}>
                Output format: <span style={{ color: GREEN }}>run.json</span> + <span style={{ color: GREEN }}>tasks.jsonl</span>
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: "var(--font-mono)", fontSize: 13, color: "#666" }}>
                See the repository <span style={{ color: GREEN }}>README</span> for details.
              </p>
            </div>
          </Section>

        </div>
      </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "48px 0", borderTop: `1px solid ${BORDER}` }}>
      <h2 style={{
        margin: "0 0 24px",
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22,
        color: TEXT, letterSpacing: "-0.02em",
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const BODY: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-sans)",
  fontSize: 16,
  color: "#B0B8C8",
  lineHeight: 1.7,
};
