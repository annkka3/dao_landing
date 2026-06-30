import type { SecuritySummary } from "../types";

function value(summary: SecuritySummary | undefined, direct: keyof SecuritySummary, byType?: string): number {
  const directValue = summary?.[direct];
  if (typeof directValue === "number") return directValue;
  if (byType) return summary?.by_type?.[byType] ?? 0;
  return 0;
}

export function SecuritySummaryCards({ summary }: { summary?: SecuritySummary }) {
  const cards = [
    ["Events 24h", value(summary, "total_events_24h") || summary?.total_events || 0],
    ["Rate limits 24h", value(summary, "rate_limit_exceeded_24h", "rate_limit_exceeded")],
    ["Bot limits 24h", value(summary, "bot_command_rate_limited_24h", "bot_command_rate_limited")],
    ["Failed purchases", value(summary, "failed_purchase_24h", "failed_purchase")],
    ["Failed rewards", value(summary, "failed_reward_24h", "failed_reward")],
    [
      "Insufficient balance",
      value(summary, "insufficient_balance_attempt_24h", "insufficient_balance_attempt"),
    ],
    ["Suspicious Sparks", value(summary, "suspicious_sparks_flag_24h", "suspicious_sparks_flag")],
    ["Reconciliation drift", value(summary, "reconciliation_drift_24h", "reconciliation_drift")],
    [
      "High / Critical",
      value(summary, "high_critical_events_24h") || summary?.high_critical_events || 0,
    ],
  ] as const;

  return (
    <section className="security-summary-grid" aria-label="Security summary">
      {cards.map(([label, metric]) => (
        <article key={label} className="security-summary-card">
          <span>{label}</span>
          <strong>{metric}</strong>
        </article>
      ))}
    </section>
  );
}
