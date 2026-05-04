"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function NavbarV2() {
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
        borderBottom: `2px solid ${scrolled ? "#2A2A2A" : "transparent"}`,
        backgroundColor: scrolled ? "rgba(17,17,17,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        padding: "0 24px",
        transition: "border-color 200ms, background-color 200ms",
      }}
    >
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{
            fontFamily: "var(--font-condensed)",
            fontSize: 18,
            color: "#FFFFFF",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}>
            NEAR
          </span>
          <span style={{
            width: 4,
            height: 4,
            backgroundColor: "#00EC97",
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 6,
            color: "#00EC97",
            letterSpacing: "0.06em",
            lineHeight: 1,
          }}>
            AGENTBENCH
          </span>
          {/* V2 badge */}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            color: "#111",
            backgroundColor: "#00EC97",
            padding: "2px 5px",
            letterSpacing: "0.06em",
            lineHeight: 1,
          }}>
            V2
          </span>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link
            href="/v2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#00EC97",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              border: "2px solid #00EC97",
              padding: "4px 12px",
            }}
          >
            ▶ LEADERBOARD
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            V1 ↗
          </Link>
          <a
            href="https://github.com/pinchbench/api"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            GITHUB ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
