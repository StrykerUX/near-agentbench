"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import CircularGauge from "./CircularGauge";

type Props = {
  topScore: number;      // 0–100
  versionLabel?: string;
};

// ── Telemetry panel ───────────────────────────────────────────────────────────

type MetricRowProps = {
  label: string;
  value: number;   // 0–100
  color?: string;
  delay?: number;
};

function MetricRow({ label, value, color = "var(--accent)", delay = 0 }: MetricRowProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const num = numRef.current;
    if (!bar || !num) return;

    const obj = { val: 0 };
    gsap.fromTo(bar,
      { width: "0%" },
      { width: `${value}%`, duration: 1.2, ease: "power2.out", delay }
    );
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: "power2.out",
      delay,
      onUpdate() { if (num) num.textContent = `${obj.val.toFixed(1)}%`; },
    });
  }, [value, delay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          {label}
        </span>
        <span
          ref={numRef}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-data)",
          }}
        >
          0.0%
        </span>
      </div>
      <div style={{
        height: 3,
        borderRadius: 2,
        backgroundColor: "var(--border)",
        overflow: "hidden",
      }}>
        <div
          ref={barRef}
          style={{
            height: "100%",
            borderRadius: 2,
            background: `linear-gradient(90deg, ${color}, var(--accent-blue))`,
            width: "0%",
          }}
        />
      </div>
    </div>
  );
}

// ── Main hero ─────────────────────────────────────────────────────────────────

export default function HeroSection({ topScore: topScoreRaw, versionLabel }: Props) {
  const topScore = typeof topScoreRaw === "number" && !isNaN(topScoreRaw) ? topScoreRaw : 0;

  const tagRef      = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const legendRef   = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [tagRef.current, titleRef.current, subtitleRef.current, legendRef.current];
    gsap.fromTo(els.filter(Boolean),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out", delay: 0.1 }
    );
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.05 }
    );
  }, []);

  const score1 = topScore;
  const score2 = Math.min(100, topScore * 0.94);
  const score3 = Math.min(100, topScore * 1.03);

  return (
    <section
      style={{
        borderBottom: "1px solid var(--border)",
        background: `
          radial-gradient(ellipse 70% 80% at 60% 40%,
            rgba(0, 236, 151, 0.04) 0%,
            transparent 65%
          ),
          radial-gradient(ellipse 50% 60% at 20% 80%,
            rgba(77, 158, 255, 0.03) 0%,
            transparent 65%
          )
        `,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "72px 24px 80px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 64,
          alignItems: "center",
        }}
        className="max-sm:grid-cols-1 max-sm:gap-10"
      >
        {/* ── Left: text ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Tag */}
          <div ref={tagRef} style={{ opacity: 0 }}>
            <span className="near-tag">
              <span style={{ fontSize: 8 }}>+</span>
              BENCHMARK OPEN
            </span>
          </div>

          {/* Title */}
          <div ref={titleRef} style={{ opacity: 0 }}>
            <h1 style={{ margin: 0 }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(36px, 6vw, 72px)",
                  color: "var(--accent)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                NEAR
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(36px, 6vw, 72px)",
                  color: "var(--text)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                AGENTBENCH
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            style={{
              opacity: 0,
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              color: "var(--text-muted)",
              lineHeight: 1.7,
              maxWidth: 420,
            }}
          >
            Competitive benchmark for AI agents on NEAR Protocol.
            Track performance across models, runs, and providers.
          </p>

          {/* Legend */}
          <div
            ref={legendRef}
            style={{
              opacity: 0,
              display: "flex",
              gap: 20,
              alignItems: "center",
            }}
          >
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "var(--accent)", flexShrink: 0 }} />
              IRONCLAW
            </span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "var(--accent-blue)", flexShrink: 0 }} />
              OPENCLAW
            </span>
          </div>
        </div>

        {/* ── Right: telemetry panel ── */}
        <div
          ref={panelRef}
          style={{
            opacity: 0,
            width: 300,
            border: "1px solid var(--border)",
            borderRadius: 8,
            backgroundColor: "var(--bg-card)",
            overflow: "hidden",
            flexShrink: 0,
          }}
          className="max-sm:w-full"
        >
          {/* Panel header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderBottom: "1px solid var(--border)",
              backgroundColor: "rgba(0, 236, 151, 0.04)",
            }}
          >
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              + BENCHMARK TELEMETRY
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div className="live-dot" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--accent)", letterSpacing: "0.06em" }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Gauge area */}
          <div
            style={{
              padding: "24px 20px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CircularGauge percentage={topScore} size={120} />
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 2,
              }}>
                TOP SCORE
              </div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--accent)",
                letterSpacing: "-0.02em",
              }}>
                {topScore.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Metric rows */}
          <div style={{
            padding: "0 20px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            <MetricRow label="PERFORMANCE" value={score1} delay={0.4} />
            <MetricRow label="ACCURACY" value={score2} color="var(--accent-blue)" delay={0.55} />
            <MetricRow label="COVERAGE" value={score3} color="rgba(0,236,151,0.6)" delay={0.7} />
          </div>

          {/* Panel footer */}
          <div style={{
            borderTop: "1px solid var(--border)",
            padding: "8px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}>
              {versionLabel ? `VERSION ${versionLabel}` : "NEAR PROTOCOL"}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--border)" }}>
              ◆
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
