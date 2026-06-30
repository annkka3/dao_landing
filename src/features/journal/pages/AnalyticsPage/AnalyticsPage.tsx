import { useState } from "react";
import { Button } from "../../../../shared/ui/Button/Button";
import { ApiError } from "../../../../api/errors";
import { useJournalAnalytics } from "../../hooks";
import {
  DisciplineScoreCard,
  JournalEmptyState,
  JournalErrorState,
  JournalLoadingState,
  JournalPageShell,
  PatternInsightCard,
  PeriodToggle,
  TiltScoreCard,
  WarningCard,
  formatPct,
} from "../../components/JournalComponents";
import type { AnalyticsPeriod } from "../../types";

export function AnalyticsPage({ onBack }: { onBack?: () => void }) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const analytics = useJournalAnalytics(period);

  return (
    <JournalPageShell title="Аналитика" subtitle="Дисциплина, tilt и паттерны за период." onBack={onBack}>
      <PeriodToggle value={period} onChange={setPeriod} />
      {analytics.isLoading ? (
        <JournalLoadingState />
      ) : analytics.isError ? (
        ApiError.isApiError(analytics.error) && analytics.error.code === "PROFILE_NOT_FOUND" ? (
          <JournalEmptyState
            title="Сначала настрой свои правила риска"
            message="Аналитика появится после профиля и нескольких действий в журнале."
            action={<Button variant="secondary" onClick={onBack}>К обзору</Button>}
          />
        ) : (
          <JournalErrorState error={analytics.error} onRetry={() => void analytics.refetch()} />
        )
      ) : analytics.data ? (
        <>
          <section className="jg-grid">
            <DisciplineScoreCard
              score={analytics.data.discipline.score}
              status={analytics.data.discipline.data_quality}
            />
            <TiltScoreCard
              score={analytics.data.tilt.score}
              status={analytics.data.tilt.status}
            />
          </section>

          <section className="jg-grid">
            <Metric label="Сделок" value={analytics.data.trade_summary.trades_total} />
            <Metric label="No-trade" value={analytics.data.no_trade_summary.decisions} />
            <Metric label="Чеклисты" value={`${analytics.data.checklist_summary.passed}/${analytics.data.checklist_summary.completed}`} />
            <Metric label="Искры" value={analytics.data.rewards_summary.sparks_granted} />
          </section>

          <section className="jg-card">
            <span className="jg-card__eyebrow">Risk summary</span>
            <h2>Риск за {analytics.data.period.label}</h2>
            <p>
              Avg {formatPct(analytics.data.risk_summary.avg_risk_pct)} · Max {formatPct(analytics.data.risk_summary.max_risk_pct)}
            </p>
            <div className="jg-grid" style={{ marginTop: 10 }}>
              <Metric label="Over limit" value={analytics.data.risk_summary.over_limit_trades} />
              <Metric label="High leverage" value={analytics.data.risk_summary.high_leverage_trades} />
              <Metric label="Warnings" value={analytics.data.risk_summary.warnings_count} />
              <Metric label="Overrides" value={analytics.data.risk_summary.overrides_count} />
            </div>
          </section>

          <section className="jg-card">
            <span className="jg-card__eyebrow">Checklist quality</span>
            <h2>Pass rate {formatPct(analytics.data.checklist_summary.pass_rate)}</h2>
            {analytics.data.checklist_summary.most_failed_items.length === 0 ? (
              <p>Пока нет часто проваливаемых пунктов.</p>
            ) : (
              <div className="jg-form" style={{ marginTop: 10 }}>
                {analytics.data.checklist_summary.most_failed_items.map((item) => (
                  <div className="jg-warning" key={item.item}>
                    <strong>{item.item.replace(/_/g, " ")}</strong>
                    <p>Провалено: {item.count}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {analytics.data.patterns.length > 0 && (
            <div className="jg-form">
              {analytics.data.patterns.map((pattern) => (
                <PatternInsightCard key={pattern.code} insight={pattern} />
              ))}
            </div>
          )}

          {analytics.data.warnings.length > 0 && (
            <div className="jg-form">
              {analytics.data.warnings.map((warning) => (
                <WarningCard key={warning.code} warning={warning} />
              ))}
            </div>
          )}

          {analytics.data.trade_summary.trades_total === 0 && analytics.data.checklist_summary.completed === 0 && (
            <JournalEmptyState
              title="Аналитика появится после нескольких действий в журнале"
              message="Frontend показывает только данные backend и не рассчитывает аналитику локально."
            />
          )}
        </>
      ) : null}
    </JournalPageShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="jg-card jg-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
