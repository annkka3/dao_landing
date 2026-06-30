import type { MarketItem, SparksBalance, UserInventoryItem } from "../types";
import {
  CATEGORY_LABELS,
  RARITY_LABELS,
  SLOT_LABELS,
  formatSparks,
  futureUseLabels,
  getEquippableSlot,
} from "../constants";

export function ItemDetailSheet({
  item,
  ownedItem,
  equipped,
  balance,
  hasAuth,
  actionPending,
  equipBlockedReason,
  onClose,
  onBuy,
  onEquip,
  onUnequip,
}: {
  item: MarketItem | null;
  ownedItem?: UserInventoryItem | null;
  equipped?: boolean;
  balance?: SparksBalance;
  hasAuth: boolean;
  actionPending?: boolean;
  equipBlockedReason?: string | null;
  onClose: () => void;
  onBuy: (item: MarketItem) => void;
  onEquip?: (item: UserInventoryItem) => void;
  onUnequip?: (item: UserInventoryItem) => void;
}) {
  if (!item) return null;

  const slot = getEquippableSlot(item);
  const price = item.price_sparks;
  const canBuy = hasAuth && !ownedItem && item.status === "active" && price != null && (balance?.balance ?? 0) >= price;
  const blockedReason =
    !hasAuth ? "Открой через Telegram, чтобы покупать предметы"
      : ownedItem ? "Предмет уже в инвентаре"
        : item.status === "sold_out" ? "Предмет распродан"
          : price == null ? "Покупка пока недоступна"
            : (balance?.balance ?? 0) < price ? "Недостаточно Искр"
              : null;

  return (
    <div className="dm__overlay" role="dialog" aria-modal="true">
      <div className={`dm__sheet dm__sheet--${item.category}`}>
        <button className="dm__close" type="button" onClick={onClose}>×</button>
        <div className="dm__detail-media">
          {item.asset_url || item.preview_asset_url ? (
            <img src={item.asset_url ?? item.preview_asset_url ?? ""} alt="" />
          ) : (
            <span>◇</span>
          )}
        </div>
        <div className="dm__detail-copy">
          <span className="dm__eyebrow">{CATEGORY_LABELS[item.category]} · {RARITY_LABELS[item.rarity]}</span>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <div className="dm__detail-badges">
            <span>{formatSparks(price)} ✦</span>
            <span>{slot ? SLOT_LABELS[slot] : "Коллекция"}</span>
            {item.is_limited && <span>Limited {item.supply_sold}/{item.supply_limit ?? "∞"}</span>}
          </div>
          {futureUseLabels(item.metadata).length > 0 && (
            <div className="dm__future">
              <span>Будущее применение</span>
              {futureUseLabels(item.metadata).map((label) => <em key={label}>{label}</em>)}
            </div>
          )}
          {(blockedReason || equipBlockedReason) && <p className="dm__blocked">{blockedReason ?? equipBlockedReason}</p>}
          <div className="dm__sheet-actions">
            {!ownedItem && (
              <button
                className="dm__primary-btn"
                type="button"
                disabled={!canBuy || actionPending}
                onClick={() => onBuy(item)}
              >
                {actionPending ? "..." : "Купить"}
              </button>
            )}
            {ownedItem && slot && (
              <button
                className={equipped ? "dm__ghost-btn dm__ghost-btn--danger" : "dm__primary-btn"}
                type="button"
                disabled={actionPending || (!equipped && Boolean(equipBlockedReason))}
                onClick={() => (equipped ? onUnequip?.(ownedItem) : onEquip?.(ownedItem))}
              >
                {actionPending ? "..." : equipped ? "Снять" : "Надеть"}
              </button>
            )}
            <button className="dm__ghost-btn" type="button" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  );
}
