import React from "react";

const ORANGE = "#E8801A";
const GREEN  = "#00EC97";
const BG     = "#000000";
const CARD   = "#111111";
const BORDER = "#1E1E1E";
const TEXT   = "#FFFFFF";
const MUTED  = "#888888";

const BODY: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-sans)",
  fontSize: 16,
  color: "#B0B8C8",
  lineHeight: 1.7,
};

function Section({ eyebrow, title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "56px 0", borderTop: `1px solid ${BORDER}` }}>
      {eyebrow && (
        <p style={{ margin: "0 0 12px", fontFamily: "var(--font-mono)", fontSize: 11, color: ORANGE, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{
        margin: "0 0 24px",
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(24px, 3vw, 32px)",
        color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.1,
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: BG, color: TEXT, fontFamily: "var(--font-sans)" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 40px 64px" }}>
        <p style={{ margin: "0 0 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: ORANGE, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          About
        </p>
        <h1 style={{
          margin: "0 0 24px",
          fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: "clamp(36px, 5vw, 56px)",
          letterSpacing: "-0.03em", lineHeight: 1.05, color: TEXT,
        }}>
          We built the benchmark we wished existed.
        </h1>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, color: MUTED, lineHeight: 1.65, maxWidth: 620 }}>
          AgentBench.ai is an independent research group focused on AI agent security. We don't build
          models. We don't sell frameworks. We measure how they behave together under adversarial
          conditions — and publish everything we find.
        </p>
      </section>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 40px 120px", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* ── Why We Exist ──────────────────────────────────────────────── */}
        <Section eyebrow="Why We Exist" title="The standard benchmarks were answering the wrong question.">
          <p style={BODY}>
            Every major AI safety benchmark we could find reported a single score per model. Clean.
            Comparable. Easy to cite in a press release.
          </p>
          <p style={{ ...BODY, marginTop: 16 }}>
            But every one of those scores was generated inside a specific agent runtime — a framework
            controlling what tools the model could call, what data it could see, how its responses
            got parsed, and what its system prompt told it about how to behave. That framework was
            almost never disclosed. Readers had no way to know whether the score reflected the model
            or the benchmark's hidden infrastructure choices.
          </p>
          <p style={{ ...BODY, marginTop: 16 }}>
            We kept asking: what happens to that score when you change the framework? Nobody had
            measured it. So we did.
          </p>
        </Section>

        {/* ── Methodology ───────────────────────────────────────────────── */}
        <Section eyebrow="Our Methodology" title="Adaptive. Adversarial. Transparent.">
          <p style={BODY}>
            The core design principle behind AgentBench.ai is that a benchmark should be harder to
            game than the attacks it's simulating.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              {
                label: "Red-team adversary",
                text: "Our red-team adversary is itself a frontier language model — not a fixed script, not a static payload library. It reads the agent's full reasoning trace between attempts and refines its approach. If an agent holds up when the attacker can see exactly how it thinks, we have meaningful evidence of robustness. If it fails, we can pinpoint the step in its reasoning where the attack landed.",
              },
              {
                label: "(model, framework) pairs",
                text: "That's why we test (model, framework) pairs, not models alone. Agent safety is a property of the system, not the component.",
              },
              {
                label: "Full transparency",
                text: "That's why we publish everything: scenario corpus, runtime harnesses, the judge, and verbatim reasoning traces. Methodology that can't be scrutinized can't be trusted.",
              },
            ].map((item) => (
              <div key={item.label} style={{
                display: "grid", gridTemplateColumns: "180px 1fr",
                gap: 24, padding: "20px 0",
                borderBottom: `1px solid ${BORDER}`,
                alignItems: "start",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: GREEN, lineHeight: 1.4 }}>
                  {item.label}
                </span>
                <p style={{ ...BODY, fontSize: 15 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Open Source ───────────────────────────────────────────────── */}
        <Section eyebrow="Open Source" title="The benchmark belongs to the community.">
          <p style={BODY}>
            Everything is public. The scenario corpus. The per-scenario sidecar definitions. The
            runtime harnesses for each framework. The judge. The full matrix of run artifacts
            including verbatim reasoning traces.
          </p>
          <p style={{ ...BODY, marginTop: 16 }}>
            Adding a new framework requires writing a small adapter and running the corpus through
            it. Adding a scenario uses a declarative format covering the workspace, the user request,
            and the invariants that count as a violation. Pull requests are welcome. Scrutiny is
            welcomed more.
          </p>
          <div style={{ marginTop: 24, padding: "16px 20px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
              If you find a flaw in our methodology, we want to know. The point is a benchmark that
              earns trust, not one that asserts it.
            </p>
          </div>
        </Section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section style={{ padding: "56px 0", borderTop: `1px solid ${BORDER}` }}>
          <h2 style={{
            margin: "0 0 32px",
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(24px, 3vw, 32px)",
            color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>
            Read the research. Run it yourself. Tell us where we're wrong.
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href="https://github.com/nearai/benchmarks"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                backgroundColor: ORANGE, color: "#FFFFFF",
                fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15,
                padding: "12px 24px", borderRadius: 8, textDecoration: "none",
                letterSpacing: "-0.01em", transition: "opacity 150ms",
              }}
            >
              View the benchmark →
            </a>
            <a
              href="https://github.com/nearai/benchmarks"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                backgroundColor: "transparent", color: TEXT,
                fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15,
                padding: "12px 24px", borderRadius: 8, textDecoration: "none",
                border: `1px solid ${BORDER}`, letterSpacing: "-0.01em",
                transition: "border-color 150ms",
              }}
            >
              Read the paper →
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}
