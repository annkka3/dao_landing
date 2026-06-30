import "../styles/daoMarket.css";
import type { SparksBalance } from "../types";
import { formatSparks } from "../constants";

export function SparksBalanceWidget({
  balance,
  isLoading,
  isError,
  compact,
  onOpenMarket,
}: {
  balance?: SparksBalance;
  isLoading?: boolean;
  isError?: boolean;
  compact?: boolean;
  onOpenMarket?: () => void;
}) {
  return (
    <section className={`dm__sparks${compact ? " dm__sparks--compact" : ""}`}>
      <div className="dm__sparks-orb" aria-hidden="true">✦</div>
      <div className="dm__sparks-copy">
        <span className="dm__eyebrow">ИСКРЫ DAO</span>
        <strong>{isLoading ? "..." : isError ? "—" : formatSparks(balance?.balance)}</strong>
        {!compact && (
          <p>
            Заработано {formatSparks(balance?.total_earned)} · потрачено{" "}
            {formatSparks(balance?.total_spent)}
          </p>
        )}
      </div>
      {onOpenMarket && (
        <button className="dm__sparks-btn" type="button" onClick={onOpenMarket}>
          DAO Market
        </button>
      )}
    </section>
  );
}
