import type { MarketItem, MarketPurchaseResult } from "../types";
import { formatSparks } from "../constants";

export function PurchaseSuccessModal({
  result,
  item,
  canEquip,
  isEquipping,
  onEquip,
  onInventory,
  onContinue,
}: {
  result: MarketPurchaseResult | null;
  item: MarketItem | null;
  canEquip?: boolean;
  isEquipping?: boolean;
  onEquip?: () => void;
  onInventory?: () => void;
  onContinue: () => void;
}) {
  if (!result || !item) return null;

  return (
    <div className="dm__overlay" role="dialog" aria-modal="true">
      <div className="dm__success">
        <button className="dm__close" type="button" onClick={onContinue}>×</button>
        <div className="dm__success-orb">✦</div>
        <span className="dm__eyebrow">ПОКУПКА ГОТОВА</span>
        <h2>{item.title}</h2>
        <p>Предмет добавлен в инвентарь. Баланс: {formatSparks(result.balance_after)} Искр.</p>
        <div className="dm__sheet-actions">
          {canEquip && (
            <button className="dm__primary-btn" type="button" onClick={onEquip} disabled={isEquipping}>
              {isEquipping ? "Надеваем..." : "Надеть сейчас"}
            </button>
          )}
          <button className="dm__ghost-btn" type="button" onClick={onInventory}>
            Инвентарь
          </button>
          <button className="dm__ghost-btn" type="button" onClick={onContinue}>
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
