import type { ReactNode } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { friendlyErrorMessage } from "../../../api/errorMessages";
import type {
  ChecklistItemKey,
  OverviewWarning,
  PatternInsight,
  RewardInfo,
  RiskStatus,
  TradeSummaryCardData,
} from "../types";
import "./JournalComponents.css";

export const CHECKLIST_LABELS: Record<ChecklistItemKey, string> = {
  has_stop_loss: "Стоп-лосс выставлен",
  risk_within_limit: "Риск в рамках лимита",
  rr_acceptable: "RR соответствует плану",
  has_entry_reason: "Есть причина входа",
  matches_strategy: "Сделка по стратегии",
  no_upcoming_news: "Нет ближайших новостей",
  no_loss_series: "Нет серии убытков",
  not_in_tilt: "Нет tilt-состояния",
  no_duplicate_risk: "Нет дублирующего риска",
};

export const CHECKLIST_KEYS = Object.keys(CHECKLIST_LABELS) as ChecklistItemKey[];

export function JournalPageShell({
  title,
  subtitle,
  onBack,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="jg">
      <header className="jg__header">
        <div className="jg__header-top">
          {onBack ? (
            <button className="jg__back" type="button" onClick={onBack} aria-label="Назад">
              <ArrowLeftIcon />
            </button>
          ) : <span className="jg__back-spacer" />}
          <span className="jg__brand">CR DAO</span>
          <span className="jg__status-dot" />
        </div>
        <div className="jg__title-row">
          <div className="jg__line" />
          <h1>{title}</h1>
          <div className="jg__line" />
        </div>
        {subtitle && <p>{subtitle}</p>}
        {actions && <div className="jg__actions">{actions}</div>}
      </header>
      <section className="jg__frame">{children}</section>
    </main>
  );
}

export function RiskBudgetBar({
  usedPct,
  limitPct,
  remainingPct,
  label,
  status,
}: {
  usedPct: string | number | null | undefined;
  limitPct: string | number | null | undefined;
  remainingPct: string | number | null | undefined;
  label: string;
  status?: RiskStatus | "calm" | "warning" | "high_risk";
}) {
  const used = clampPct(safeNumber(usedPct));
  const limit = safeNumber(limitPct);
  const remaining = safeNumber(remainingPct);
  return (
    <div className={`jg-budget jg-budget--${status ?? "calm"}`}>
      <div className="jg-budget__head">
        <span>{label}</span>
        <strong>{formatPct(usedPct)} / {formatPct(limitPct)}</strong>
      </div>
      <div className="jg-budget__track">
        <span style={{ width: `${used}%` }} />
      </div>
      <div className="jg-budget__foot">
        <span>Осталось {formatPct(remaining)}</span>
        <span>Лимит {Number.isFinite(limit) ? `${limit}%` : "—"}</span>
      </div>
    </div>
  );
}

export function RiskStatusBadge({ status }: { status: RiskStatus | "calm" | "warning" | "high_risk" }) {
  const label: Record<string, string> = {
    green: "GREEN",
    yellow: "YELLOW",
    red: "RED",
    calm: "CALM",
    warning: "WARNING",
    high_risk: "HIGH RISK",
  };
  return <span className={`jg-risk-badge jg-risk-badge--${status}`}>{label[status] ?? status}</span>;
}

export function RewardBadge({ reward }: { reward: RewardInfo | null | undefined }) {
  if (!reward) return <span className="jg-reward-badge jg-reward-badge--muted">Reward pending</span>;
  if (reward.cap_exceeded) return <span className="jg-reward-badge jg-reward-badge--warn">Лимит наград</span>;
  if (!reward.reward_granted) return <span className="jg-reward-badge jg-reward-badge--muted">Без награды</span>;
  return <span className="jg-reward-badge">+{reward.amount} Sparks</span>;
}

export function RewardResultCard({ reward, title }: { reward: RewardInfo | null | undefined; title?: string }) {
  const message = reward?.reward_granted
    ? `Искры получены: ${reward.amount}`
    : reward?.cap_exceeded
      ? "Действие записано, но дневной лимит наград уже достигнут."
      : "Действие записано. Награда сейчас недоступна.";

  return (
    <article className="jg-card jg-reward-card">
      <div>
        <span className="jg-card__eyebrow">{reward?.reward_type ?? "reward"}</span>
        <h2>{title ?? "Результат записан"}</h2>
        <p>{message}</p>
      </div>
      <RewardBadge reward={reward} />
      {reward?.reward_rules_version && (
        <small>Rules {reward.reward_rules_version}</small>
      )}
    </article>
  );
}

export function ChecklistItem({
  itemKey,
  checked,
  onChange,
}: {
  itemKey: ChecklistItemKey;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="jg-checkitem">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="jg-checkitem__box" aria-hidden="true" />
      <span>{CHECKLIST_LABELS[itemKey]}</span>
    </label>
  );
}

export function TradeCard({ trade, onOpen }: { trade: TradeSummaryCardData; onOpen?: (id: string) => void }) {
  return (
    <button className="jg-trade-card" type="button" onClick={() => onOpen?.(trade.id)}>
      <span className="jg-trade-card__pair">{trade.symbol}</span>
      <span className="jg-trade-card__meta">{trade.direction.toUpperCase()} · {trade.market_type}</span>
      <RiskStatusBadge status={trade.risk_status} />
      <span className="jg-trade-card__risk">{formatPct(trade.risk_pct)}</span>
    </button>
  );
}

export function WarningCard({ warning }: { warning: OverviewWarning }) {
  return (
    <article className={`jg-warning jg-warning--${warning.severity}`}>
      <strong>{warning.code.replace(/_/g, " ")}</strong>
      <p>{warning.message}</p>
    </article>
  );
}

export function PatternInsightCard({ insight }: { insight: PatternInsight }) {
  return (
    <article className={`jg-card jg-card--${insight.severity}`}>
      <span className="jg-card__eyebrow">{insight.code}</span>
      <h2>{insight.code.replace(/_/g, " ")}</h2>
      <p>{insight.description}</p>
    </article>
  );
}

export function DisciplineScoreCard({
  score,
  status,
}: {
  score: number | null | undefined;
  status?: string | null;
}) {
  return <ScoreCard label="Индекс дисциплины" score={score} status={status} tone="green" />;
}

export function TiltScoreCard({
  score,
  status,
}: {
  score: number | null | undefined;
  status?: string | null;
}) {
  return <ScoreCard label="Tilt-статус" score={score} status={status} tone="violet" />;
}

export function PeriodToggle({
  value,
  onChange,
}: {
  value: "7d" | "30d";
  onChange: (value: "7d" | "30d") => void;
}) {
  return (
    <div className="jg-period" role="tablist" aria-label="Период аналитики">
      {(["7d", "30d"] as const).map((period) => (
        <button
          key={period}
          type="button"
          className={value === period ? "jg-period__btn jg-period__btn--active" : "jg-period__btn"}
          onClick={() => onChange(period)}
        >
          {period === "7d" ? "7D" : "30D"}
        </button>
      ))}
    </div>
  );
}

export function JournalLoadingState() {
  return <div className="jg-state">Загрузка Risk Guardian...</div>;
}

export function JournalErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="jg-state">
      <strong>Не удалось загрузить данные</strong>
      <p>{friendlyErrorMessage(error)}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Повторить</Button>}
    </div>
  );
}

export function JournalEmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="jg-state">
      <strong>{title}</strong>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function safeNumber(value: string | number | null | undefined): number {
  if (value == null || value === "") return Number.NaN;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function formatPct(value: string | number | null | undefined): string {
  const parsed = safeNumber(value);
  if (!Number.isFinite(parsed)) return "—";
  return `${trimNumber(parsed)}%`;
}

export function trimNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function ScoreCard({
  label,
  score,
  status,
  tone,
}: {
  label: string;
  score: number | null | undefined;
  status?: string | null;
  tone: "green" | "violet";
}) {
  return (
    <article className={`jg-score jg-score--${tone}`}>
      <span>{label}</span>
      <strong>{score == null ? "—" : score}</strong>
      <small>{status ?? "Данных пока мало"}</small>
    </article>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
