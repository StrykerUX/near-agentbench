"use client";


const ORANGE = "#E8801A";
const BG     = "#000000";

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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 5px)", gap: 1 }}>
      {grid.flat().map((on, i) => (
        <div
          key={i}
          style={{
            width: 5, height: 5,
            backgroundColor: on ? ORANGE : "transparent",
          }}
        />
      ))}
    </div>
  );
}

// Discord SVG icon
function DiscordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
        fill="#9CA3AF"
      />
    </svg>
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
  { label: "Benchmarks", href: "#benchmarks", active: false },
  { label: "Leaderboard", href: "#leaderboard", active: true  },
  { label: "Docs",        href: "#docs",        active: false },
  { label: "Blog",        href: "#blog",        active: false },
  { label: "About",       href: "#about",       active: false },
];

export default function HeroV9() {
  return (
    <div style={{ backgroundColor: BG, color: "#FFFFFF", fontFamily: "var(--font-sans)" }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 40px",
        height: 72,
        display: "flex",
        alignItems: "center",
        gap: 48,
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <PixelIcon />
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
            <span style={{ color: "#FFFFFF" }}>Agent</span>
            <span style={{ color: ORANGE }}>Bench</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 36, flex: 1 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <a href="#discord" style={{ display: "flex", alignItems: "center", opacity: 0.9, transition: "opacity 150ms" }}>
            <DiscordIcon />
          </a>
          <a href="#github" style={{ display: "flex", alignItems: "center", opacity: 0.9, transition: "opacity 150ms" }}>
            <GitHubIcon />
          </a>
          <a
            href="#get-started"
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

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px 80px",
        height: "calc(100vh - 72px)",
        minHeight: 640,
        gap: 0,
      }}>

        {/* Hero video */}
        <div style={{ width: "100%", maxWidth: 760, marginBottom: 8 }}>
          <video
            src="/AgentBench-animation.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }}
          />
        </div>

        {/* Headline */}
        <h1 style={{
          margin: "0 0 6px",
          fontSize: "clamp(40px, 6vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "#FFFFFF",
          fontFamily: "var(--font-sans)",
        }}>
          Evaluate. Compare. Advance.
        </h1>

        {/* Sub-headline */}
        <h2 style={{
          margin: "0 0 28px",
          fontSize: "clamp(40px, 6vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: ORANGE,
          fontFamily: "var(--font-sans)",
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
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#benchmarks"
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
