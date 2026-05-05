"use client";

import { usePathname } from "next/navigation";

const ORANGE = "#E8801A";
const GITHUB_URL = "https://github.com/nearai/benchmarks";

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
        <div key={i} style={{ width: 3, height: 3, backgroundColor: on ? ORANGE : "transparent" }} />
      ))}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
        fill="#9CA3AF"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Leaderboard", href: "/" },
  { label: "About",       href: "/about" },
];

const STYLES = `
  .site-nav-links { display: flex; }
  .site-nav-cta   { display: inline-flex; }
  @media (max-width: 680px) {
    .site-nav-links { display: none !important; }
    .site-nav-cta   { display: none !important; }
    .site-nav       { padding: 0 24px !important; gap: 12px !important; }
  }
`;

export default function Navbar() {
  const activePath = usePathname();
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40 }}>
      <style>{STYLES}</style>
      <nav
        className="site-nav"
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
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, textDecoration: "none" }}>
          <PixelIcon />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "var(--font-display)" }}>
            <span style={{ color: "#FFFFFF" }}>Agent</span>
            <span style={{ color: ORANGE }}>Bench</span>
          </span>
        </a>

        {/* Nav links */}
        <div className="site-nav-links" style={{ alignItems: "center", gap: 36, flex: 1 }}>
          {NAV_LINKS.map((item) => {
            const active = activePath === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: active ? "#4ADE80" : "#D1D5DB",
                  textDecoration: "none",
                  paddingBottom: active ? 4 : 0,
                  borderBottom: active ? "2px solid #4ADE80" : "none",
                  transition: "color 150ms",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, marginLeft: "auto" }}>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", opacity: 0.9, transition: "opacity 150ms" }}>
            <GitHubIcon />
          </a>
          {/* Get Started — hidden until destination is ready
          <a
            href="#get-started"
            className="site-nav-cta"
            style={{
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
              fontFamily: "var(--font-sans)",
            }}
          >
            Get Started
            <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
          </a>
          */}
        </div>
      </nav>
    </div>
  );
}
