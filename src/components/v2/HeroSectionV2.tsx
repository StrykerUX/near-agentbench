"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { GlobalStats } from "@/lib/types";

type Props = {
  topScore: number;
  stats: GlobalStats;
};

// Fixed pixel square decorations
const SQUARES = [
  { top: "8%",  left: "2%",  size: 18, color: "#00EC97", opacity: 0.85 },
  { top: "22%", left: "6%",  size: 9,  color: "#2979FF", opacity: 0.7  },
  { top: "65%", left: "3%",  size: 14, color: "#00EC97", opacity: 0.5  },
  { top: "80%", left: "8%",  size: 6,  color: "#FFFFFF", opacity: 0.3  },
  { top: "12%", right: "4%", size: 12, color: "#2979FF", opacity: 0.8  },
  { top: "40%", right: "2%", size: 20, color: "#00EC97", opacity: 0.6  },
  { top: "70%", right: "5%", size: 8,  color: "#FFFFFF", opacity: 0.25 },
  { top: "50%", left: "14%", size: 6,  color: "#2979FF", opacity: 0.4  },
];

// Pixel ruler: alternating teal/blue squares
function PixelRuler() {
  return (
    <div style={{ display: "flex", width: "100%", overflow: "hidden", height: 8 }}>
      {Array.from({ length: 200 }, (_, i) => (
        <div
          key={i}
          style={{
            flex: "1 0 0",
            height: "100%",
            backgroundColor: i % 4 < 2 ? "#2979FF" : "#00EC97",
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSectionV2({ topScore, stats }: Props) {
  const titleRef   = useRef<HTMLDivElement>(null);
  const subRef     = useRef<HTMLDivElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const squaresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Squares float in
    if (squaresRef.current) {
      const sq = squaresRef.current.querySelectorAll("[data-sq]");
      gsap.fromTo(sq,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06, ease: "back.out(2)" }
      );
      // Gentle float animation
      sq.forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? -8 : 8,
          duration: 2 + i * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
    .fromTo(subRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(statsRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      "-=0.15"
    )
    .fromTo(panelRef.current,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
      "-=0.4"
    );
  }, []);

  return (
    <section style={{
      position: "relative",
      backgroundColor: "#111111",
      borderBottom: "2px solid #2A2A2A",
      overflow: "hidden",
    }}>
      {/* Subtle grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* Floating pixel squares */}
      <div ref={squaresRef} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {SQUARES.map((sq, i) => (
          <div
            key={i}
            data-sq
            style={{
              position: "absolute",
              top: sq.top,
              left: "left" in sq ? sq.left : undefined,
              right: "right" in sq ? (sq as {right: string}).right : undefined,
              width: sq.size,
              height: sq.size,
              backgroundColor: sq.color,
              opacity: sq.opacity,
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>

      {/* Top pixel ruler */}
      <PixelRuler />

      {/* Content */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "56px 24px 60px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 48,
        alignItems: "center",
        position: "relative",
        zIndex: 2,
      }}>
        {/* Left: text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Pixel tag */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: "#00EC97",
            letterSpacing: "0.1em",
          }}>
            <span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#00EC97" }} />
            POWERED BY NEAR PROTOCOL
          </div>

          {/* Main title */}
          <div ref={titleRef} style={{ opacity: 0 }}>
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-condensed)",
              lineHeight: 0.92,
              letterSpacing: "0.01em",
            }}>
              <span style={{
                display: "block",
                fontSize: "clamp(64px, 10vw, 120px)",
                color: "#FFFFFF",
              }}>
                NEAR
              </span>
              <span style={{
                display: "block",
                fontSize: "clamp(64px, 10vw, 120px)",
                color: "#FFFFFF",
              }}>
                AGENT
              </span>
              <span style={{
                display: "block",
                fontSize: "clamp(64px, 10vw, 120px)",
                background: "linear-gradient(90deg, #2979FF, #00EC97)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                BENCH
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div ref={subRef} style={{ opacity: 0 }}>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "#555",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              maxWidth: 420,
              lineHeight: 1.8,
            }}>
              Competitive benchmark for AI agents.<br />
              Track performance across models, runs, and providers.
            </p>
          </div>

          {/* Inline stats */}
          <div ref={statsRef} style={{ opacity: 0, display: "flex", gap: 0, alignItems: "stretch" }}>
            {[
              { label: "MODELS",   value: stats.total_models      },
              { label: "RUNS",     value: stats.total_submissions  },
              { label: "PROVIDERS",value: stats.total_providers    },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{ color: "#2A2A2A", fontSize: 18, margin: "0 16px", fontWeight: 100 }}>|</span>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{
                    fontFamily: "var(--font-condensed)",
                    fontSize: 28,
                    color: "#00EC97",
                    lineHeight: 1,
                  }}>
                    {s.value.toLocaleString()}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "#444",
                    letterSpacing: "0.1em",
                  }}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: IronClaw mascot panel */}
        <div
          ref={panelRef}
          style={{
            opacity: 0,
            position: "relative",
            width: 320,
            flexShrink: 0,
          }}
        >
          {/* Top gradient bar (pixel style) */}
          <div style={{
            height: 12,
            background: "linear-gradient(90deg, #2979FF, #00EC97)",
            marginBottom: 0,
            imageRendering: "pixelated",
          }} />

          {/* Panel body */}
          <div style={{
            backgroundColor: "#1A1A1A",
            border: "2px solid #2A2A2A",
            borderTop: "none",
            padding: "24px 20px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            position: "relative",
          }}>
            {/* Corner decorations */}
            {[{t:8,l:8},{t:8,r:8},{b:8,l:8},{b:8,r:8}].map((pos, i) => (
              <div key={i} aria-hidden style={{
                position: "absolute",
                top: "top" in pos ? (pos as {t: number; l?: number; r?: number}).t : undefined,
                bottom: "bottom" in pos ? (pos as {b: number; l?: number; r?: number}).b : undefined,
                left: "l" in pos ? (pos as {l: number}).l : undefined,
                right: "r" in pos ? (pos as {r: number}).r : undefined,
                width: 6,
                height: 6,
                backgroundColor: i % 2 === 0 ? "#2979FF" : "#00EC97",
                opacity: 0.6,
              }} />
            ))}

            {/* IronClaw mascot */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ironclaw-nearai-–-3.webp"
              alt="IronClaw — NEAR AI Agent"
              style={{
                width: "100%",
                maxWidth: 260,
                objectFit: "contain",
                imageRendering: "auto",
                display: "block",
              }}
            />

            {/* Score display */}
            <div style={{
              width: "100%",
              borderTop: "2px solid #2A2A2A",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 6,
                  color: "#444",
                  letterSpacing: "0.1em",
                  marginBottom: 4,
                }}>
                  TOP SCORE
                </div>
                <div style={{
                  fontFamily: "var(--font-condensed)",
                  fontSize: 36,
                  color: "#00EC97",
                  lineHeight: 1,
                }}>
                  {topScore.toFixed(1)}%
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 6,
                  color: "#444",
                  letterSpacing: "0.1em",
                  marginBottom: 4,
                }}>
                  IRONCLAW
                </div>
                <div style={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}>
                  <div style={{ width: 6, height: 6, backgroundColor: "#2979FF" }} />
                  <div style={{ width: 6, height: 6, backgroundColor: "#00EC97" }} />
                  <div style={{ width: 6, height: 6, backgroundColor: "#FFFFFF", opacity: 0.3 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom pixel ruler */}
      <PixelRuler />
    </section>
  );
}
