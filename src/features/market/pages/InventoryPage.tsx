import { useMemo, useState } from "react";
import { friendlyErrorMessage } from "../../../api/errorMessages";
import { BrandHeader } from "../../../shared/components/BrandHeader/BrandHeader";
import { notifyError, notifySuccess } from "../../../shared/notifications/notify";
import { archetypeAssets, type ArchetypeId } from "../../../shared/assets/archetypeAssets";
import { useAppContext } from "../../../store/AppContext";
import { getTelegramInitData, triggerHaptic } from "../../../telegram/webapp";
import { getEquippableSlot, tabMatchesCategory, type MarketTabKey } from "../constants";
import { characterSkinBlockedReason } from "../equipped";
import {
  useEquipInventoryItem,
  useEquippedItems,
  useUnequipInventoryItem,
  useUnequipSlot,
  useUserInventory,
} from "../hooks";
import type { EquippedItemSlot, UserInventoryItem } from "../types";
import { EquippedItemsPanel } from "../components/EquippedItemsPanel";
import { InventoryItemCard } from "../components/InventoryItemCard";
import { MarketCategoryTabs } from "../components/MarketCategoryTabs";
import { MarketEmptyState } from "../components/MarketEmptyState";
import { MarketErrorState } from "../components/MarketErrorState";
import "../styles/daoMarket.css";

export function InventoryPage({
  onBack,
  onMarket,
}: {
  onBack?: () => void;
  onMarket?: () => void;
}) {
  const { state } = useAppContext();
  const hasAuth = Boolean(getTelegramInitData());
  const [activeTab, setActiveTab] = useState<MarketTabKey>("all");
  const [pendingSlot, setPendingSlot] = useState<EquippedItemSlot | null>(null);
  const currentArchetypeId = resolveCurrentArchetype(state.currentParticipant?.archetype_slug);

  const inventoryQuery = useUserInventory({ limit: 100 }, hasAuth);
  const equippedQuery = useEquippedItems(hasAuth);
  const equipMutation = useEquipInventoryItem();
  const unequipMutation = useUnequipInventoryItem();
  const unequipSlotMutation = useUnequipSlot();

  const equippedUserItemIds = useMemo(
    () => new Set((equippedQuery.data?.items ?? []).map((item) => item.user_item_id)),
    [equippedQuery.data?.items]
  );

  const items = useMemo(() => {
    const raw = inventoryQuery.data?.items ?? [];
    return raw.filter((item) => tabMatchesCategory(activeTab, item.item.category));
  }, [activeTab, inventoryQuery.data?.items]);

  async function handleEquip(item: UserInventoryItem) {
    const blockedReason =
      getEquippableSlot(item.item) === "character_skin"
        ? characterSkinBlockedReason(item.item.metadata, currentArchetypeId)
        : null;
    if (blockedReason) {
      triggerHaptic("error");
      notifyError("Нельзя надеть скин", blockedReason);
      return;
    }

    try {
      await equipMutation.mutateAsync(item.user_item_id);
      triggerHaptic("success");
      notifySuccess("Предмет надет", item.item.title);
    } catch (err) {
      triggerHaptic("error");
      notifyError("Не удалось надеть предмет", friendlyErrorMessage(err));
    }
  }

  async function handleUnequip(item: UserInventoryItem) {
    try {
      await unequipMutation.mutateAsync(item.user_item_id);
      triggerHaptic("success");
      notifySuccess("Предмет снят", item.item.title);
    } catch (err) {
      triggerHaptic("error");
      notifyError("Не удалось снять предмет", friendlyErrorMessage(err));
    }
  }

  async function handleUnequipSlot(slot: EquippedItemSlot) {
    setPendingSlot(slot);
    try {
      await unequipSlotMutation.mutateAsync(slot);
      triggerHaptic("success");
      notifySuccess("Слот очищен");
    } catch (err) {
      triggerHaptic("error");
      notifyError("Не удалось очистить слот", friendlyErrorMessage(err));
    } finally {
      setPendingSlot(null);
    }
  }

  return (
    <main className="dm">
      <header className="dm__header">
        <button className="dm__back" type="button" onClick={onBack} aria-label="Назад">‹</button>
        <BrandHeader />
        <button className="dm__top-action" type="button" onClick={onMarket}>Market</button>
      </header>

      <section className="dm__hero dm__hero--inventory">
        <span className="dm__eyebrow">INVENTORY</span>
        <h1>Твоя коллекция</h1>
        <p>Здесь лежат купленные и выданные предметы. Можно надеть поддерживаемые косметические слоты.</p>
      </section>

      {!hasAuth ? (
        <MarketEmptyState
          title="Инвентарь доступен в Telegram"
          message="Открой Mini App через бота, чтобы увидеть свои предметы."
        />
      ) : (
        <>
          <EquippedItemsPanel
            items={equippedQuery.data?.items ?? []}
            pendingSlot={pendingSlot}
            onUnequipSlot={handleUnequipSlot}
          />

          <MarketCategoryTabs active={activeTab} onChange={setActiveTab} />

          {inventoryQuery.isError ? (
            <MarketErrorState
              message={friendlyErrorMessage(inventoryQuery.error)}
              onRetry={() => void inventoryQuery.refetch()}
            />
          ) : inventoryQuery.isLoading ? (
            <div className="dm__inventory-list">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="dm__skeleton dm__skeleton--row" />)}
            </div>
          ) : items.length === 0 ? (
            <MarketEmptyState
              title="В инвентаре пока пусто"
              message="Открой DAO Market и забери первый предмет за Искры."
            />
          ) : (
            <div className="dm__inventory-list">
              {items.map((item) => (
                <InventoryItemCard
                  key={item.user_item_id}
                  item={item}
                  equipped={equippedUserItemIds.has(item.user_item_id)}
                  actionPending={equipMutation.isPending || unequipMutation.isPending}
                  equipBlockedReason={
                    getEquippableSlot(item.item) === "character_skin"
                      ? characterSkinBlockedReason(item.item.metadata, currentArchetypeId)
                      : null
                  }
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function resolveCurrentArchetype(slug?: string | null): ArchetypeId | null {
  return slug && slug in archetypeAssets ? (slug as ArchetypeId) : null;
}
