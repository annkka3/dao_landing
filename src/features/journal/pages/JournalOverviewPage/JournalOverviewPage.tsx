import { Button } from "../../../../shared/ui/Button/Button";
import { ApiError } from "../../../../api/errors";
import { useJournalOverview } from "../../hooks";
import {
  JournalEmptyState,
  JournalErrorState,
  JournalLoadingState,
  JournalPageShell,
  RiskBudgetBar,
  TradeCard,
  WarningCard,
  formatPct,
} from "../../components/JournalComponents";

export function JournalOverviewPage({
  onBack,
  onAddTrade,
  onAnalytics,
  onJournal,
  onProfile,
  onTrade,
}: {
  onBack?: () => void;
  onAddTrade?: () => void;
  onAnalytics?: () => void;
  onJournal?: () => void;
  onProfile?: () => void;
  onTrade?: (id: string) => void;
}) {
  const overview = useJournalOverview();

  return (
    <JournalPageShell
      title="Risk Guardian"
      subtitle="Страж Риска: бюджет, дисциплина и журнал сделок."
      onBack={onBack}
      actions={
        <>
          <Button variant="primary" onClick={onAddTrade}>Добавить сделку</Button>
          <Button variant="secondary" onClick={onProfile}>Правила риска</Button>
        </>
      }
    >
      {overview.isLoading ? (
        <JournalLoadingState />
      ) : overview.isError ? (
        ApiError.isApiError(overview.error) && overview.error.code === "PROFILE_NOT_FOUND" ? (
          <JournalEmptyState
            title="Сначала настрой свои правила риска"
            message="Risk Guardian начнёт считать бюджет после профиля риска."
            action={<Button variant="secondary" onClick={onProfile}>Настроить Risk Guardian</Button>}
          />
        ) : (
          <JournalErrorState error={overview.error} onRetry={() => void overview.refetch()} />
        )
      ) : overview.data ? (
        <>
          <section className="jg-grid">
            <article className="jg-card jg-metric">
              <span>Deposit</span>
              <strong>{overview.data.profile.deposit} {overview.data.profile.account_currency}</strong>
            </article>
            <article className="jg-card jg-metric">
              <span>Risk per trade</span>
              <strong>{formatPct(overview.data.profile.risk_per_trade_pct)}</strong>
            </article>
          </section>

          <RiskBudgetBar
            label="Дневной риск-бюджет"
            usedPct={overview.data.budget.daily_used_pct}
            limitPct={overview.data.budget.daily_limit_pct}
            remainingPct={overview.data.budget.daily_remaining_pct}
            status={budgetStatus(overview.data.budget.daily_used_pct, overview.data.budget.daily_limit_pct)}
          />
          <RiskBudgetBar
            label="Недельный риск-бюджет"
            usedPct={overview.data.budget.weekly_used_pct}
            limitPct={overview.data.budget.weekly_limit_pct}
            remainingPct={overview.data.budget.weekly_remaining_pct}
            status={budgetStatus(overview.data.budget.weekly_used_pct, overview.data.budget.weekly_limit_pct)}
          />

          <section className="jg-grid">
            <Metric label="Сделок сегодня" value={overview.data.activity_today.trades_created} />
            <Metric label="Активных" value={overview.data.activity_today.active_trades} />
            <Metric label="Чеклистов" value={overview.data.activity_today.checklists_completed} />
            <Metric label="Искры сегодня" value={overview.data.rewards_today.sparks_granted} />
          </section>

          {overview.data.warnings.length > 0 && (
            <section className="jg-form">
              {overview.data.warnings.map((warning) => (
                <WarningCard key={warning.code} warning={warning} />
              ))}
            </section>
          )}

          <section className="jg-card">
            <span className="jg-card__eyebrow">Latest trades</span>
            <h2>Последние сделки</h2>
            {overview.data.latest_trades.length === 0 ? (
              <p>Пока сделок нет. Добавь первую сделку, чтобы увидеть риск.</p>
            ) : (
              <div className="jg-form" style={{ marginTop: 10 }}>
                {overview.data.latest_trades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} onOpen={onTrade} />
                ))}
              </div>
            )}
          </section>

          <section className="jg__actions">
            <Button variant="secondary" onClick={onAnalytics}>Аналитика</Button>
            <Button variant="ghost" onClick={onJournal}>Журнал</Button>
          </section>
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

function budgetStatus(usedRaw: string, limitRaw: string): "green" | "yellow" | "red" {
  const used = Number.parseFloat(usedRaw);
  const limit = Number.parseFloat(limitRaw);
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return "green";
  const ratio = used / limit;
  if (ratio >= 1) return "red";
  if (ratio >= 0.8) return "yellow";
  return "green";
}
