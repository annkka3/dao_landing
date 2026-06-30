import { Button } from "../../../../shared/ui/Button/Button";
import {
  formatPct,
  JournalEmptyState,
  JournalErrorState,
  JournalLoadingState,
  JournalPageShell,
  RiskStatusBadge,
} from "../../components/JournalComponents";
import { useJournalTradeDetail } from "../../hooks";
import type { TradeRewardSummary } from "../../types";

export function TradeDetailPage({
  tradeId,
  onBack,
}: {
  tradeId: string | null;
  onBack?: () => void;
}) {
  const detail = useJournalTradeDetail(tradeId);

  if (!tradeId) {
    return (
      <JournalPageShell title="Детали сделки" onBack={onBack}>
        <JournalEmptyState
          title="Сделка не выбрана"
          message="Открой сделку из журнала или обзора Risk Guardian."
          action={<Button variant="secondary" onClick={onBack}>К журналу</Button>}
        />
      </JournalPageShell>
    );
  }

  if (detail.isLoading) {
    return (
      <JournalPageShell title="Детали сделки" onBack={onBack}>
        <JournalLoadingState />
      </JournalPageShell>
    );
  }

  if (detail.isError) {
    return (
      <JournalPageShell title="Детали сделки" onBack={onBack}>
        <JournalErrorState error={detail.error} onRetry={() => void detail.refetch()} />
      </JournalPageShell>
    );
  }

  if (!detail.data) {
    return (
      <JournalPageShell title="Детали сделки" onBack={onBack}>
        <JournalEmptyState title="Сделка не найдена" message="Запись недоступна для текущего пользователя." />
      </JournalPageShell>
    );
  }

  const { trade, checklist, rewards, skip, events } = detail.data;

  return (
    <JournalPageShell
      title={trade.symbol}
      subtitle={`${trade.direction.toUpperCase()} · ${trade.market_type} · ${trade.status}`}
      onBack={onBack}
    >
      <article className="jg-card jg-detail-hero">
        <div>
          <span className="jg-card__eyebrow">Risk status</span>
          <h2>{formatPct(trade.risk_pct)} риска</h2>
          <p>RR {trade.rr_ratio ?? "—"} · плечо {trade.leverage}x</p>
        </div>
        <RiskStatusBadge status={trade.risk_status} />
      </article>

      <section className="jg-detail-grid" aria-label="Параметры сделки">
        <DetailMetric label="Вход" value={trade.entry_price} />
        <DetailMetric label="Стоп" value={trade.stop_loss ?? "—"} />
        <DetailMetric label="Тейк" value={trade.take_profit ?? "—"} />
        <DetailMetric label="Размер" value={trade.position_size} />
      </section>

      {trade.warnings.length > 0 && (
        <article className="jg-warning jg-warning--danger">
          <strong>Risk warnings</strong>
          <p>{trade.warnings.map(labelize).join(", ")}</p>
        </article>
      )}

      <article className="jg-card">
        <span className="jg-card__eyebrow">Checklist</span>
        <h2>{checklist.exists ? checklist.completion_score : "Не заполнен"}</h2>
        <p>
          {checklist.exists
            ? checklist.passed
              ? "Pre-trade checklist пройден."
              : `Провалены: ${checklist.failed_items.map(labelize).join(", ")}`
            : "Для сделки пока нет checklist записи."}
        </p>
        {checklist.completed_at && <small className="jg-muted">{formatDate(checklist.completed_at)}</small>}
      </article>

      {skip.is_skipped && (
        <article className="jg-card">
          <span className="jg-card__eyebrow">No-trade</span>
          <h2>{skip.reason ? labelize(skip.reason) : "Сделка пропущена"}</h2>
          {skip.skipped_at && <p>{formatDate(skip.skipped_at)}</p>}
        </article>
      )}

      <RewardSummaryCard rewards={rewards} />

      <article className="jg-card">
        <span className="jg-card__eyebrow">Timeline</span>
        <div className="jg-timeline">
          {events.length === 0 ? (
            <p>Событий пока нет.</p>
          ) : events.map((event) => (
            <div className="jg-timeline__item" key={`${event.event_type}-${event.created_at}`}>
              <strong>{labelize(event.event_type)}</strong>
              <span>{formatDate(event.created_at)}</span>
            </div>
          ))}
        </div>
      </article>
    </JournalPageShell>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="jg-card jg-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function RewardSummaryCard({ rewards }: { rewards: TradeRewardSummary }) {
  return (
    <article className="jg-card">
      <span className="jg-card__eyebrow">Sparks</span>
      <h2>{rewards.sparks_granted_total > 0 ? `+${rewards.sparks_granted_total}` : "0"}</h2>
      <div className="jg-reward-row">
        <span className={rewards.checklist_reward_granted ? "jg-pill jg-pill--on" : "jg-pill"}>
          Checklist
        </span>
        <span className={rewards.no_trade_reward_granted ? "jg-pill jg-pill--on" : "jg-pill"}>
          No-trade
        </span>
      </div>
    </article>
  );
}

function labelize(value: string): string {
  return value.replace(/_/g, " ");
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
