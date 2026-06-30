import { useMemo, useState } from "react";
import { Button } from "../../../../shared/ui/Button/Button";
import { friendlyErrorMessage } from "../../../../api/errorMessages";
import { useCompleteChecklist } from "../../hooks";
import type { ChecklistItemKey, ChecklistResponse } from "../../types";
import {
  CHECKLIST_KEYS,
  ChecklistItem,
  JournalEmptyState,
  JournalPageShell,
  RewardResultCard,
  WarningCard,
} from "../../components/JournalComponents";

export function ChecklistPage({
  tradeId,
  onBack,
  onReward,
  onSkip,
}: {
  tradeId: string | null;
  onBack?: () => void;
  onReward?: (response: ChecklistResponse) => void;
  onSkip?: () => void;
}) {
  const [items, setItems] = useState<Record<ChecklistItemKey, boolean>>(() =>
    Object.fromEntries(CHECKLIST_KEYS.map((key) => [key, false])) as Record<ChecklistItemKey, boolean>
  );
  const [notes, setNotes] = useState("");
  const [lastResult, setLastResult] = useState<ChecklistResponse | null>(null);
  const complete = useCompleteChecklist();
  const checkedCount = useMemo(() => Object.values(items).filter(Boolean).length, [items]);

  async function submit() {
    if (!tradeId) return;
    const response = await complete.mutateAsync({
      tradeId,
      payload: { items, notes: notes || null, checklist_version: "v1" },
    });
    setLastResult(response);
    onReward?.(response);
  }

  return (
    <JournalPageShell title="Чеклист" subtitle="9 условий перед входом в сделку." onBack={onBack}>
      {!tradeId ? (
        <JournalEmptyState
          title="Сделка не выбрана"
          message="Открой чеклист после создания сделки в Risk Guardian."
        />
      ) : (
        <>
          <section className="jg-card">
            <span className="jg-card__eyebrow">Checklist v1</span>
            <h2>{checkedCount} / {CHECKLIST_KEYS.length}</h2>
            <p>Награда возможна только если backend подтвердит прохождение чеклиста.</p>
          </section>
          <div className="jg-form">
            {CHECKLIST_KEYS.map((key) => (
              <ChecklistItem
                key={key}
                itemKey={key}
                checked={items[key]}
                onChange={(checked) => setItems((prev) => ({ ...prev, [key]: checked }))}
              />
            ))}
            <label className="jg-field">
              <span>Notes</span>
              <textarea className="jg-textarea" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
            <div className="jg__actions">
              <Button variant="secondary" onClick={onSkip}>Skip Trade</Button>
              <Button onClick={submit} loading={complete.isPending}>Complete Checklist</Button>
            </div>
          </div>
          {complete.isError && (
            <WarningCard warning={{ code: "checklist_error", severity: "danger", message: friendlyErrorMessage(complete.error) }} />
          )}
          {lastResult && <RewardResultCard reward={lastResult.reward} title={lastResult.passed ? "Чеклист пройден" : "Чеклист записан"} />}
        </>
      )}
    </JournalPageShell>
  );
}
