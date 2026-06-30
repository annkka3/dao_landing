import { useState } from "react";
import { Button } from "../../../../shared/ui/Button/Button";
import {
  JournalEmptyState,
  JournalErrorState,
  JournalLoadingState,
  JournalPageShell,
  TradeCard,
} from "../../components/JournalComponents";
import { useJournalTrades } from "../../hooks";
import type { TradeStatus } from "../../types";

type FilterKey = "all" | Extract<TradeStatus, "active" | "draft" | "skipped" | "closed">;

const FILTERS: Array<{ key: FilterKey; label: string; status?: TradeStatus }> = [
  { key: "all", label: "Все" },
  { key: "active", label: "Активные", status: "active" },
  { key: "draft", label: "Черновики", status: "draft" },
  { key: "skipped", label: "Пропущены", status: "skipped" },
  { key: "closed", label: "Закрытые", status: "closed" },
];

export function TradeJournalPage({
  onBack,
  onAddTrade,
  onOpenTrade,
}: {
  onBack?: () => void;
  onAddTrade?: () => void;
  onOpenTrade?: (tradeId: string) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const activeFilter = FILTERS.find((item) => item.key === filter) ?? FILTERS[0];
  const trades = useJournalTrades({ status: activeFilter.status, limit: 50, offset: 0 });

  return (
    <JournalPageShell
      title="Журнал сделок"
      subtitle="Все сохранённые сделки и no-trade решения"
      onBack={onBack}
      actions={<Button variant="secondary" onClick={onAddTrade}>Новая сделка</Button>}
    >
      <div className="jg-filter-list" aria-label="Фильтры журнала">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            className={filter === item.key ? "jg-filter jg-filter--active" : "jg-filter"}
            type="button"
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {trades.isLoading && <JournalLoadingState />}
      {trades.isError && <JournalErrorState error={trades.error} onRetry={() => void trades.refetch()} />}

      {trades.isSuccess && trades.data.items.length === 0 && (
        <JournalEmptyState
          title={filter === "all" ? "Пока сделок нет" : "В этом статусе сделок нет"}
          message="Добавь сделку или вернись к обзору Risk Guardian."
          action={<Button variant="secondary" onClick={onAddTrade}>Добавить сделку</Button>}
        />
      )}

      {trades.isSuccess && trades.data.items.length > 0 && (
        <>
          <div className="jg-list-head">
            <span>{trades.data.pagination.total} записей</span>
            <span>{activeFilter.label}</span>
          </div>
          <div className="jg-trade-list">
            {trades.data.items.map((trade) => (
              <TradeCard key={trade.id} trade={trade} onOpen={onOpenTrade} />
            ))}
          </div>
        </>
      )}
    </JournalPageShell>
  );
}
