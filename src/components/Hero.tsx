"use client";

const ORANGE = "#E8801A";
const BG     = "#000000";

const RESPONSIVE = `
  @media (max-width: 680px) {
    .hw-hero {
      padding: 24px 16px 56px !important;
      height: auto !important;
      min-height: 560px !important;
    }
    .hw-cta-row {
      flex-direction: column !important;
      width: 100%;
      padding: 0 8px;
    }
    .hw-cta-btn {
      width: 100% !important;
      min-width: unset !important;
    }
  }
  @media (max-height: 700px) {
    .hw-hero {
      height: auto !important;
      min-height: unset !important;
      padding-top: 20px !important;
      padding-bottom: 32px !important;
    }
    .hw-video { max-height: 35vh !important; overflow: hidden !important; }
    .hw-video video { height: 35vh !important; width: auto !important; max-width: 100% !important; object-fit: contain !important; }
  }
`;

export default function Hero() {
  return (
    <div style={{ position: "relative", backgroundColor: BG, color: "#FFFFFF", fontFamily: "var(--font-sans)" }}>
      <style>{RESPONSIVE}</style>

      {/* Grid background — covers navbar + hero */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="hw-hero"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px 80px",
          height: "calc(100vh - 72px)",
          minHeight: 640,
          gap: 0,
        }}
      >
        {/* Hero video */}
        <div className="hw-video" style={{ width: "100%", maxWidth: 760, marginBottom: -16 }}>
          <video
            src="/AgentBench-animation.mp4"
            autoPlay
            loop
            muted
            playsInline
            poster="/agent-bench-img.webp"
            preload="none"
            style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }}
          />
        </div>

        {/* Headline */}
        <h1 style={{
          margin: "0 0 6px",
          fontSize: "clamp(32px, 6vw, 72px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "#FFFFFF",
          fontFamily: "var(--font-display)",
        }}>
          Evaluate. Compare. Choose.
        </h1>

        {/* Sub-headline */}
        <h2 style={{
          margin: "0 0 28px",
          fontSize: "clamp(32px, 6vw, 72px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: ORANGE,
          fontFamily: "var(--font-display)",
        }}>
          Agents, objectively.
        </h2>

        {/* Description */}
        <p style={{
          margin: "0 0 44px",
          fontSize: 17,
          lineHeight: 1.6,
          color: "#9CA3AF",
          maxWidth: 500,
          fontWeight: 400,
          fontFamily: "var(--font-sans)",
        }}>
          AgentBench is an open platform for evaluating AI agents across
          real-world tasks, environments, and capabilities.
        </p>

        {/* CTA Buttons — hidden until destination pages are ready
        <div className="hw-cta-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#benchmarks"
            className="hw-cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: ORANGE,
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 16,
              padding: "16px 32px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              minWidth: 240,
              justifyContent: "center",
              transition: "opacity 150ms",
            }}
          >
            Explore Benchmarks
            <span style={{ fontSize: 20, lineHeight: 1 }}>→</span>
          </a>

          <a
            href="#leaderboard"
            className="hw-cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#1C1C1C",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 16,
              padding: "16px 32px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              border: "1px solid #2E2E2E",
              minWidth: 240,
              justifyContent: "center",
              transition: "opacity 150ms",
            }}
          >
            View Leaderboard
          </a>
        </div>
        */}
      </section>

    </div>
  );
}
