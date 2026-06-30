import type { UserInventoryItem } from "../types";
import { CATEGORY_LABELS, RARITY_LABELS, SLOT_LABELS, getEquippableSlot } from "../constants";

const SLOT_USE_LABELS = {
  profile_frame: "профиль, таблица лидеров и финал сезона",
  share_card_template: "карточки шаринга итогов, приглашений и выборов",
  room_theme: "лобби, комната и игровая панель",
  character_skin: "образ твоего текущего персонажа",
  meme_skin: "мемные визуальные блоки профиля",
} as const;

export function InventoryItemCard({
  item,
  equipped,
  actionPending,
  equipBlockedReason,
  onEquip,
  onUnequip,
}: {
  item: UserInventoryItem;
  equipped?: boolean;
  actionPending?: boolean;
  equipBlockedReason?: string | null;
  onEquip?: (item: UserInventoryItem) => void;
  onUnequip?: (item: UserInventoryItem) => void;
}) {
  const slot = getEquippableSlot(item.item);
  const equipBlocked = Boolean(equipBlockedReason);
  return (
    <article className={`dm__inventory-card dm__inventory-card--${item.item.rarity} dm__inventory-card--${item.item.category}`}>
      <div className="dm__inventory-media">
        {item.item.preview_asset_url || item.item.asset_url ? (
          <img src={item.item.preview_asset_url ?? item.item.asset_url ?? ""} alt="" />
        ) : (
          <span>◇</span>
        )}
      </div>
      <div className="dm__inventory-body">
        <span className="dm__item-category">{CATEGORY_LABELS[item.item.category]}</span>
        <strong>{item.item.title}</strong>
        <p>{RARITY_LABELS[item.item.rarity]} · {item.status}</p>
        {slot ? (
          <>
            <span className="dm__inventory-use">
              Где используется: {SLOT_LABELS[slot]} · {SLOT_USE_LABELS[slot]}
            </span>
            {equipped && (
              <span className="dm__inventory-active-note">
                Этот предмет уже применяется в интерфейсе.
              </span>
            )}
            {!equipped && equipBlockedReason && (
              <span className="dm__inventory-active-note">
                {equipBlockedReason}
              </span>
            )}
          </>
        ) : (
          <span className="dm__inventory-use">
            Этот предмет хранится в инвентаре и не меняет игровой счёт.
          </span>
        )}
      </div>
      {slot && (
        <button
          className={equipped ? "dm__ghost-btn dm__ghost-btn--danger" : "dm__primary-mini"}
          type="button"
          disabled={actionPending || equipBlocked}
          onClick={() => (equipped ? onUnequip?.(item) : onEquip?.(item))}
        >
          {actionPending ? "..." : equipped ? "Снять" : "Надеть"}
        </button>
      )}
    </article>
  );
}
