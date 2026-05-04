"use client";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        backgroundColor: scrolled ? "rgba(8, 12, 20, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "background-color 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            near
          </span>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 7,
              color: "var(--accent)",
              letterSpacing: "0.06em",
              lineHeight: 1,
            }}
          >
            AGENTBENCH
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            className="near-button active"
            style={{ cursor: "default" }}
          >
            <span>+</span> LEADERBOARD
          </span>
          <span
            className="near-button"
            style={{ cursor: "default" }}
          >
            ABOUT
          </span>
        </div>

        {/* Right side */}
        <div style={{ marginLeft: "auto" }}>
          <a
            href="https://github.com/pinchbench/api"
            target="_blank"
            rel="noopener noreferrer"
            className="near-button"
          >
            GITHUB ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
