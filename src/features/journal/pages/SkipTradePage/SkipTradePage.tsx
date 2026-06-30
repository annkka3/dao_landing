import { useState } from "react";
import { Button } from "../../../../shared/ui/Button/Button";
import { friendlyErrorMessage } from "../../../../api/errorMessages";
import { useSkipTrade } from "../../hooks";
import type { SkipReason, SkipTradeResponse } from "../../types";
import {
  JournalEmptyState,
  JournalPageShell,
  RewardResultCard,
  WarningCard,
} from "../../components/JournalComponents";

const REASONS: Array<{ value: SkipReason; label: string }> = [
  { value: "risk_too_high", label: "Риск слишком высокий" },
  { value: "no_clear_plan", label: "Нет чёткого плана" },
  { value: "revenge_trade_detected", label: "Похоже на revenge trade" },
  { value: "over_daily_budget", label: "Дневной бюджет исчерпан" },
  { value: "over_weekly_budget", label: "Недельный бюджет исчерпан" },
  { value: "high_leverage", label: "Слишком высокий leverage" },
  { value: "no_stop_loss", label: "Нет stop loss" },
  { value: "emotional_state_bad", label: "Плохое эмоциональное состояние" },
  { value: "market_unclear", label: "Рынок неясен" },
  { value: "other", label: "Другая причина" },
];

export function SkipTradePage({
  tradeId,
  onBack,
  onReward,
}: {
  tradeId: string | null;
  onBack?: () => void;
  onReward?: (response: SkipTradeResponse) => void;
}) {
  const [reason, setReason] = useState<SkipReason>("risk_too_high");
  const [notes, setNotes] = useState("");
  const [lastResult, setLastResult] = useState<SkipTradeResponse | null>(null);
  const skip = useSkipTrade();

  async function submit() {
    if (!tradeId) return;
    const response = await skip.mutateAsync({
      tradeId,
      payload: { reason, notes: notes || null, emotional_tag: null },
    });
    setLastResult(response);
    onReward?.(response);
  }

  return (
    <JournalPageShell title="Пропустить сделку" subtitle="Дисциплина тоже записывается." onBack={onBack}>
      {!tradeId ? (
        <JournalEmptyState title="Сделка не выбрана" message="Skip доступен после создания или открытия сделки." />
      ) : (
        <>
          <section className="jg-card">
            <span className="jg-card__eyebrow">No-trade decision</span>
            <h2>Зафиксируй причину</h2>
            <p>Это не штраф. Risk Guardian отмечает решение не входить, если риск не подходит твоим правилам.</p>
          </section>
          <div className="jg-form">
            <label className="jg-field">
              <span>Reason</span>
              <select className="jg-select" value={reason} onChange={(event) => setReason(event.target.value as SkipReason)}>
                {REASONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="jg-field">
              <span>Notes</span>
              <textarea className="jg-textarea" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
            <Button onClick={submit} loading={skip.isPending}>Skip Trade</Button>
          </div>
          {skip.isError && (
            <WarningCard warning={{ code: "skip_error", severity: "danger", message: friendlyErrorMessage(skip.error) }} />
          )}
          {lastResult && <RewardResultCard reward={lastResult.reward} title="No-trade записан" />}
        </>
      )}
    </JournalPageShell>
  );
}
