"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { GlobalStats } from "@/lib/types";

type StatItemProps = { target: number; label: string; delay?: number };

function StatItem({ target, label, delay = 0 }: StatItemProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numRef.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: "power2.out",
      delay,
      onUpdate() {
        if (numRef.current) numRef.current.textContent = Math.round(obj.val).toLocaleString();
      },
    });
  }, [target, delay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      <span
        ref={numRef}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(28px, 4vw, 44px)",
          color: "var(--accent)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        0
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function StatsBar({ stats }: { stats: GlobalStats }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        backgroundColor: "var(--bg-card)",
        padding: "28px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        overflow: "hidden",
      }}
    >
      <StatItem target={stats.total_models} label="Models" delay={0} />

      <div style={{
        width: 1,
        height: 40,
        backgroundColor: "var(--border)",
        margin: "0 40px",
        flexShrink: 0,
      }} />

      <StatItem target={stats.total_submissions} label="Total Runs" delay={0.1} />

      <div style={{
        width: 1,
        height: 40,
        backgroundColor: "var(--border)",
        margin: "0 40px",
        flexShrink: 0,
      }} />

      <StatItem target={stats.total_providers} label="Providers" delay={0.2} />
    </div>
  );
}
