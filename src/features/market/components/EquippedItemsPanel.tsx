import type { EquippedItem, EquippedItemSlot } from "../types";
import { SLOT_LABELS, SUPPORTED_EQUIP_SLOTS } from "../constants";

export function EquippedItemsPanel({
  items,
  pendingSlot,
  onUnequipSlot,
}: {
  items: EquippedItem[];
  pendingSlot?: EquippedItemSlot | null;
  onUnequipSlot?: (slot: EquippedItemSlot) => void;
}) {
  const bySlot = new Map(items.map((item) => [item.slot, item]));
  return (
    <section className="dm__equipped">
      <div className="dm__section-head">
        <span className="dm__section-title">НАДЕТО СЕЙЧАС</span>
        <span className="dm__section-sub">{items.length}/{SUPPORTED_EQUIP_SLOTS.length}</span>
      </div>
      <div className="dm__equipped-grid">
        {SUPPORTED_EQUIP_SLOTS.map((slot) => {
          const equipped = bySlot.get(slot);
          return (
            <div key={slot} className="dm__equipped-slot">
              <span className="dm__equipped-label">{SLOT_LABELS[slot]}</span>
              {equipped ? (
                <>
                  <strong>{equipped.item.title}</strong>
                  <button
                    type="button"
                    className="dm__slot-unequip"
                    disabled={pendingSlot === slot}
                    onClick={() => onUnequipSlot?.(slot)}
                  >
                    {pendingSlot === slot ? "..." : "Снять"}
                  </button>
                </>
              ) : (
                <p>Пустой слот</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
