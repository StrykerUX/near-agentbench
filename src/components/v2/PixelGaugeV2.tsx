"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const TOTAL = 10;

// Interpolate hex color between blue (#2979FF) and teal (#00EC97)
function blockColor(index: number): string {
  const t = index / (TOTAL - 1);
  const r = Math.round(0x29 + t * (0x00 - 0x29));
  const g = Math.round(0x79 + t * (0xEC - 0x79));
  const b = Math.round(0xFF + t * (0x97 - 0xFF));
  return `rgb(${r},${g},${b})`;
}

type Props = { percentage: number };

export default function PixelGaugeV2({ percentage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pct   = Math.max(0, Math.min(100, percentage));
  const filled = Math.ceil((pct / 100) * TOTAL);

  useEffect(() => {
    if (!containerRef.current) return;
    const blocks = Array.from(
      containerRef.current.querySelectorAll<HTMLDivElement>("[data-filled]")
    );
    gsap.fromTo(
      blocks,
      { scaleY: 0, transformOrigin: "50% 100%" },
      { scaleY: 1, duration: 0.25, stagger: 0.07, ease: "back.out(1.4)" }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div ref={containerRef} style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <div
            key={i}
            {...(i < filled ? { "data-filled": true } : {})}
            style={{
              width: 8,
              height: i < filled ? 14 : 10,
              backgroundColor: i < filled ? blockColor(i) : "rgba(255,255,255,0.1)",
              flexShrink: 0,
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "#555",
        letterSpacing: "0.06em",
      }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}
