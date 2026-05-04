"use client";


const ORANGE = "#E8801A";
const BG     = "#000000";

const RESPONSIVE = `
  @media (max-width: 680px) {
    .hw-nav {
      padding: 0 16px !important;
      gap: 0 !important;
    }
    .hw-nav-links { display: none !important; }
    .hw-nav-cta   { display: none !important; }
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

// Pixel-art 4×4 icon that echoes the logo in the screenshot
function PixelIcon() {
  const grid = [
    [1,1,0,0, 1,1,0,0],
    [1,1,0,0, 1,1,0,0],
    [0,0,1,1, 0,0,1,1],
    [0,0,1,1, 0,0,1,1],
    [1,1,0,0, 1,1,0,0],
    [1,1,0,0, 1,1,0,0],
    [0,0,1,1, 0,0,1,1],
    [0,0,1,1, 0,0,1,1],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 3px)", gap: 1 }}>
      {grid.flat().map((on, i) => (
        <div
          key={i}
          style={{
            width: 3, height: 3,
            backgroundColor: on ? ORANGE : "transparent",
          }}
        />
      ))}
    </div>
  );
}

// GitHub SVG icon
function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
        fill="#9CA3AF"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Leaderboard", href: "#leaderboard", active: true  },
  { label: "About",       href: "#about",       active: false },
];

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

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 40 }}>
      <nav
        className="hw-nav"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          height: 72,
          display: "flex",
          alignItems: "center",
          gap: 48,
        }}
      >

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <PixelIcon />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "var(--font-display)" }}>
            <span style={{ color: "#FFFFFF" }}>Agent</span>
            <span style={{ color: ORANGE }}>Bench</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hw-nav-links" style={{ display: "flex", alignItems: "center", gap: 36, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: 15,
                fontWeight: 400,
                color: item.active ? "#4ADE80" : "#D1D5DB",
                textDecoration: "none",
                paddingBottom: item.active ? 4 : 0,
                borderBottom: item.active ? "2px solid #4ADE80" : "none",
                transition: "color 150ms",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, marginLeft: "auto" }}>
          <a href="#github" style={{ display: "flex", alignItems: "center", opacity: 0.9, transition: "opacity 150ms" }}>
            <GitHubIcon />
          </a>
          <a
            href="#get-started"
            className="hw-nav-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: ORANGE,
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: 15,
              padding: "10px 22px",
              borderRadius: 8,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              transition: "opacity 150ms",
            }}
          >
            Get Started
            <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
          </a>
        </div>
      </nav>
      </div>

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
          Evaluate. Compare. Advance.
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

        {/* CTA Buttons */}
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
      </section>

    </div>
  );
}
