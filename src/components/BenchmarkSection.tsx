import SubmissionCard from "./SubmissionCard";
import GsapScrollReveal from "./GsapScrollReveal";
import type { VersionGroup } from "@/lib/types";

export default function BenchmarkSection({ group }: { group: VersionGroup }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Version header */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingLeft: 12,
        borderLeft: "3px solid var(--accent)",
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 13,
          color: "var(--accent)",
          letterSpacing: "-0.01em",
        }}>
          + VERSION {group.versionLabel}
        </h2>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-muted)",
          letterSpacing: "0.04em",
        }}>
          {group.versionId}
        </span>
      </div>

      {/* Models */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {group.models.map((mg) => (
          <GsapScrollReveal key={`${mg.model}|||${mg.provider}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Model name + provider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--text)",
                }}>
                  {mg.model}
                </span>
                {mg.provider && (
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    padding: "2px 8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {mg.provider}
                  </span>
                )}
              </div>
              <SubmissionCard sub={mg.submission} />
            </div>
          </GsapScrollReveal>
        ))}
      </div>
    </section>
  );
}
