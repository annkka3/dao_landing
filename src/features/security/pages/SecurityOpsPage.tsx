import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../api/errors";
import { friendlyErrorMessage } from "../../../api/errorMessages";
import { BrandHeader } from "../../../shared/components/BrandHeader/BrandHeader";
import { ErrorState } from "../../../shared/ui/State/ErrorState";
import { FullScreenLoading } from "../../../shared/ui/State/FullScreenLoading";
import { getSecuritySummary, securityKeys } from "../api";
import { SecurityEventsTable } from "../components/SecurityEventsTable";
import { SecuritySummaryCards } from "../components/SecuritySummaryCards";
import { SuspiciousSparksFlagsTable } from "../components/SuspiciousSparksFlagsTable";
import "./securityOps.css";

type SecurityTab = "overview" | "events" | "flags";

export function SecurityOpsPage({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState<SecurityTab>("overview");
  const summaryQuery = useQuery({
    queryKey: securityKeys.summary,
    queryFn: getSecuritySummary,
  });

  if (summaryQuery.isLoading) {
    return <FullScreenLoading />;
  }

  if (summaryQuery.isError) {
    const accessDenied = ApiError.isApiError(summaryQuery.error) && summaryQuery.error.status === 403;
    return (
      <main className="security-page security-page--center">
        <div className="security-page__top">
          <BrandHeader />
        </div>
        <ErrorState
          title={accessDenied ? "Доступ закрыт" : "Security Console unavailable"}
          message={
            accessDenied
              ? "Этот раздел доступен только администраторам безопасности."
              : friendlyErrorMessage(summaryQuery.error)
          }
          action={onBack && <button type="button" onClick={onBack}>Назад</button>}
        />
      </main>
    );
  }

  return (
    <main className="security-page">
      <header className="security-page__top">
        {onBack && <button className="security-page__back" type="button" onClick={onBack} aria-label="Назад">‹</button>}
        <BrandHeader />
      </header>

      <section className="security-hero">
        <span>ADMIN ONLY</span>
        <h1>Security Console</h1>
        <p>
          Read-only monitoring for security events and suspicious Sparks flags.
          Economy repair, grants, deletes and balance edits are intentionally unavailable here.
        </p>
      </section>

      <nav className="security-tabs" aria-label="Security console tabs">
        <button type="button" className={tab === "overview" ? "is-active" : ""} onClick={() => setTab("overview")}>
          Overview
        </button>
        <button type="button" className={tab === "events" ? "is-active" : ""} onClick={() => setTab("events")}>
          Security Events
        </button>
        <button type="button" className={tab === "flags" ? "is-active" : ""} onClick={() => setTab("flags")}>
          Suspicious Sparks
        </button>
      </nav>

      {tab === "overview" && (
        <section className="security-panel">
          <div className="security-section-head">
            <div>
              <span>Overview</span>
              <h2>Last {summaryQuery.data?.window_hours ?? 24} hours</h2>
            </div>
            <button type="button" onClick={() => void summaryQuery.refetch()}>Refresh</button>
          </div>
          <SecuritySummaryCards summary={summaryQuery.data} />
          <div className="security-overview-grid">
            <Breakdown title="By type" items={summaryQuery.data?.by_type} />
            <Breakdown title="By severity" items={summaryQuery.data?.by_severity} />
          </div>
        </section>
      )}

      {tab === "events" && <SecurityEventsTable />}
      {tab === "flags" && <SuspiciousSparksFlagsTable />}
    </main>
  );
}

function Breakdown({ title, items }: { title: string; items?: Record<string, number> }) {
  const entries = Object.entries(items ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 12);
  return (
    <article className="security-breakdown">
      <h3>{title}</h3>
      {entries.length === 0 ? (
        <p>No events in this window.</p>
      ) : (
        <ul>
          {entries.map(([key, value]) => (
            <li key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
