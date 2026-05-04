"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  percentage: number;
  size?: number;
};

// Gauge geometry (for 88×88 viewport)
const CX = 44, CY = 44, R = 28;
const START = 150;  // degrees (SVG: 0=right, clockwise). 150° = 8 o'clock
const SWEEP = 240;  // total arc span
const ARC_LENGTH = (SWEEP * Math.PI / 180) * R; // ≈ 117.3

function pol(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: +(CX + r * Math.cos(rad)).toFixed(2), y: +(CY + r * Math.sin(rad)).toFixed(2) };
}

const bgS = pol(R, START);
const bgE = pol(R, START + SWEEP);
// 240° arc (large-arc=1, clockwise=1)
const ARC_PATH = `M ${bgS.x} ${bgS.y} A ${R} ${R} 0 1 1 ${bgE.x} ${bgE.y}`;

export default function CircularGauge({ percentage }: Props) {
  const activeRef = useRef<SVGPathElement>(null);
  const angleObj  = useRef({ val: START });
  const needleRef = useRef<SVGGElement>(null);

  const pct = Math.max(0, Math.min(100, percentage));
  const fillLen   = (pct / 100) * ARC_LENGTH;
  const finalAngle = START + (pct / 100) * SWEEP;

  const color =
    pct >= 70 ? "var(--accent)" : pct >= 40 ? "var(--warning)" : "var(--danger)";

  useEffect(() => {
    const arc = activeRef.current;
    const g   = needleRef.current;
    if (!arc || !g) return;

    angleObj.current.val = START;

    gsap.fromTo(arc,
      { strokeDashoffset: ARC_LENGTH },
      { strokeDashoffset: ARC_LENGTH - fillLen, duration: 1.4, ease: "power2.out" }
    );

    gsap.to(angleObj.current, {
      val: finalAngle,
      duration: 1.4,
      ease: "power2.out",
      onUpdate() {
        g.setAttribute("transform", `rotate(${angleObj.current.val}, ${CX}, ${CY})`);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  // 11 tick marks at every 10% of sweep
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle  = START + (i / 10) * SWEEP;
    const isMaj  = i % 5 === 0;
    return { a: pol(isMaj ? 19 : 21, angle), b: pol(26, angle), major: isMaj };
  });

  return (
    <div style={{ width: 88, height: 88, flexShrink: 0 }}>
      <svg width={88} height={88} aria-hidden>
        {/* Background arc */}
        <path d={ARC_PATH} fill="none" stroke="var(--border)" strokeWidth={2.5} strokeLinecap="round" />

        {/* Active arc — dash animation */}
        <path
          ref={activeRef}
          d={ARC_PATH}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={ARC_LENGTH}
        />

        {/* Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.a.x} y1={t.a.y}
            x2={t.b.x} y2={t.b.y}
            stroke="var(--text-muted)"
            strokeWidth={t.major ? 1.2 : 0.6}
            opacity={0.35}
          />
        ))}

        {/* Needle — rotated by GSAP via transform attr */}
        <g ref={needleRef} transform={`rotate(${START}, ${CX}, ${CY})`}>
          <line
            x1={CX - 3} y1={CY}
            x2={CX + 22} y2={CY}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>

        {/* Center pivot */}
        <circle cx={CX} cy={CY} r={2.5} fill={color} opacity={0.85} />

        {/* Percentage */}
        <text
          x={CX} y={CY + 15}
          textAnchor="middle"
          fill="var(--text-data)"
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          {Math.round(pct)}%
        </text>
      </svg>
    </div>
  );
}
