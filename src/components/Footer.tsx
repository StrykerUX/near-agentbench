"use client";

const ORANGE = "#E8801A";

const RESPONSIVE = `
  @media (max-width: 1024px) {
    .fv-content {
      grid-template-columns: 1fr 1fr 1fr 1fr !important;
      padding: 48px 24px 40px !important;
    }
  }
  @media (max-width: 680px) {
    .fv-content {
      grid-template-columns: 1fr !important;
      padding: 40px 20px 32px !important;
      gap: 32px !important;
    }
  }
`;

function PixelIcon() {
  const grid = [
    [1,1,0,0,1,1,0,0],
    [1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1],
    [0,0,1,1,0,0,1,1],
    [1,1,0,0,1,1,0,0],
    [1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1],
    [0,0,1,1,0,0,1,1],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 5px)", gap: 1 }}>
      {grid.flat().map((on, i) => (
        <div key={i} style={{ width: 5, height: 5, backgroundColor: on ? ORANGE : "transparent" }} />
      ))}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd" clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
        fill="#6B7280"
      />
    </svg>
  );
}

const COLUMNS = [
  {
    heading: "Platform",
    links: ["Benchmarks", "Leaderboard"],
  },
  {
    heading: "Resources",
    links: [],
  },
  {
    heading: "Community",
    links: ["GitHub"],
  },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#111111", color: "#FFFFFF" }}>
      <style>{RESPONSIVE}</style>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div
        className="fv-content"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "64px 40px 48px",
          display: "grid",
          gridTemplateColumns: "280px 1fr 1fr 1fr",
          gap: 48,
        }}
      >

        {/* Brand column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PixelIcon />
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "var(--font-display)" }}>
              <span style={{ color: "#FFFFFF" }}>Agent</span>
              <span style={{ color: ORANGE }}>Bench</span>
            </span>
          </div>

          {/* Description */}
          <p style={{
            margin: 0,
            fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 14,
            color: "#9CA3AF", lineHeight: 1.65,
            maxWidth: 220,
          }}>
            The open platform for evaluating AI agents across real-world tasks and environments.
          </p>

          {/* Social icons */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 4 }}>
            <a
              href="https://github.com/nearai/benchmarks"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", opacity: 1, transition: "opacity 150ms" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
            >
              <GitHubIcon />
            </a>
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <div key={col.heading} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 14,
              color: "#6B7280", letterSpacing: "0.01em",
            }}>
              {col.heading}
            </span>
            {col.links.map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  fontFamily: "var(--font-sans)", fontWeight: 400, fontSize: 15,
                  color: "#E5E7EB", textDecoration: "none",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#E5E7EB"; }}
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom border only */}
      <div style={{ borderTop: "1px solid #1E1E1E", height: 1 }} />

    </footer>
  );
}
