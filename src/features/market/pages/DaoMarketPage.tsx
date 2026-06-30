import { useMemo, useState } from "react";
import { friendlyErrorMessage } from "../../../api/errorMessages";
import { createIdempotencyKey } from "../../../api/idempotency";
import { archetypeAssets, type ArchetypeId } from "../../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../../shared/components/BrandHeader/BrandHeader";
import { notifyError, notifySuccess } from "../../../shared/notifications/notify";
import { useAppContext } from "../../../store/AppContext";
import { getTelegramInitData, triggerHaptic } from "../../../telegram/webapp";
import { formatSparks, getEquippableSlot, tabMatchesCategory, type MarketTabKey } from "../constants";
import { characterSkinBlockedReason } from "../equipped";
import {
  useEquipInventoryItem,
  useEquippedItems,
  useMarketItems,
  usePurchaseMarketItem,
  useSparksBalance,
  useUnequipInventoryItem,
  useUserInventory,
} from "../hooks";
import type { MarketItem, MarketPurchaseResult, UserInventoryItem } from "../types";
import { ItemDetailSheet } from "../components/ItemDetailSheet";
import { MarketCategoryTabs } from "../components/MarketCategoryTabs";
import { MarketEmptyState } from "../components/MarketEmptyState";
import { MarketErrorState } from "../components/MarketErrorState";
import { MarketItemCard } from "../components/MarketItemCard";
import { PurchaseConfirmSheet } from "../components/PurchaseConfirmSheet";
import { PurchaseSuccessModal } from "../components/PurchaseSuccessModal";
import { SparksBalanceWidget } from "../components/SparksBalanceWidget";
import "../styles/daoMarket.css";

export function DaoMarketPage({
  onBack,
  onInventory,
}: {
  onBack?: () => void;
  onInventory?: () => void;
}) {
  const { state } = useAppContext();
  const hasAuth = Boolean(getTelegramInitData());
  const [activeTab, setActiveTab] = useState<MarketTabKey>("all");
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [confirmItem, setConfirmItem] = useState<MarketItem | null>(null);
  const [success, setSuccess] = useState<{ result: MarketPurchaseResult; item: MarketItem } | null>(null);

  const balanceQuery = useSparksBalance(hasAuth);
  const marketQuery = useMarketItems({ limit: 100 }, true);
  const inventoryQuery = useUserInventory({ limit: 100 }, hasAuth);
  const equippedQuery = useEquippedItems(hasAuth);
  const purchaseMutation = usePurchaseMarketItem();
  const equipMutation = useEquipInventoryItem();
  const unequipMutation = useUnequipInventoryItem();

  const inventoryItems = inventoryQuery.data?.items ?? [];
  const ownedBySlug = useMemo(() => {
    const map = new Map<string, UserInventoryItem>();
    for (const item of inventoryItems) {
      if (item.status !== "revoked" && item.status !== "burned") map.set(item.item.slug, item);
    }
    return map;
  }, [inventoryItems]);

  const equippedUserItemIds = useMemo(
    () => new Set((equippedQuery.data?.items ?? []).map((item) => item.user_item_id)),
    [equippedQuery.data?.items]
  );

  const items = useMemo(() => {
    const raw = marketQuery.data?.items ?? [];
    return raw.filter((item) => tabMatchesCategory(activeTab, item.category));
  }, [activeTab, marketQuery.data?.items]);

  const selectedOwnedItem = selectedItem ? ownedBySlug.get(selectedItem.slug) ?? null : null;
  const selectedEquipped = selectedOwnedItem ? equippedUserItemIds.has(selectedOwnedItem.user_item_id) : false;
  const successOwnedItem = success ? ownedBySlug.get(success.item.slug) : undefined;
  const currentArchetypeId = resolveCurrentArchetype(state.currentParticipant?.archetype_slug);
  const selectedEquipBlockedReason =
    selectedItem && getEquippableSlot(selectedItem) === "character_skin"
      ? characterSkinBlockedReason(selectedItem.metadata, currentArchetypeId)
      : null;
  const successEquipBlockedReason =
    success && getEquippableSlot(success.item) === "character_skin"
      ? characterSkinBlockedReason(success.item.metadata, currentArchetypeId)
      : null;
  const successCanEquip = Boolean(
    success &&
    getEquippableSlot(success.item) &&
    !successEquipBlockedReason &&
    success.result.user_item.user_item_id
  );
  const confirmPreviewAvatarUrl = confirmItem
    ? archetypeAssets[resolveFramePreviewArchetype(confirmItem, state.currentParticipant?.archetype_slug)].avatar.lg
    : null;

  async function handlePurchaseConfirm() {
    if (!confirmItem) return;
    try {
      const result = await purchaseMutation.mutateAsync({
        itemSlug: confirmItem.slug,
        idempotencyKey: createIdempotencyKey("market_purchase"),
      });
      triggerHaptic("success");
      notifySuccess("Покупка готова", `${confirmItem.title} добавлен в инвентарь.`);
      setSuccess({ result, item: confirmItem });
      setConfirmItem(null);
      setSelectedItem(null);
    } catch (err) {
      triggerHaptic("error");
      notifyError("Не удалось купить предмет", friendlyErrorMessage(err));
    }
  }

  async function handleEquip(item: UserInventoryItem) {
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

  async function handleEquipSuccessItem() {
    const userItemId = success?.result.user_item.user_item_id ?? successOwnedItem?.user_item_id;
    if (!success || !userItemId) return;
    try {
      await equipMutation.mutateAsync(userItemId);
      triggerHaptic("success");
      notifySuccess("Предмет надет", success.item.title);
      setSuccess(null);
    } catch (err) {
      triggerHaptic("error");
      notifyError("Не удалось надеть предмет", friendlyErrorMessage(err));
    }
  }

  return (
    <main className="dm">
      <header className="dm__header">
        <button className="dm__back" type="button" onClick={onBack} aria-label="Назад">‹</button>
        <BrandHeader />
        <button className="dm__top-action" type="button" onClick={onInventory}>Инвентарь</button>
      </header>

      <section className="dm__hero">
        <span className="dm__eyebrow">DAO MARKET</span>
        <h1>Искры за стиль сезона</h1>
        <p>
          Искры — внутренняя игровая валюта. Предметы меняют стиль, доступы и
          коллекционный прогресс, но не влияют на очки сезона и место в leaderboard.
        </p>
      </section>

      {!hasAuth && (
        <div className="dm__notice">
          Покупки и баланс доступны только внутри Telegram Mini App.
        </div>
      )}

      <SparksBalanceWidget
        balance={balanceQuery.data}
        isLoading={hasAuth && balanceQuery.isLoading}
        isError={balanceQuery.isError}
      />

      <MarketCategoryTabs active={activeTab} onChange={setActiveTab} />

      {marketQuery.isError ? (
        <MarketErrorState
          message={friendlyErrorMessage(marketQuery.error)}
          onRetry={() => void marketQuery.refetch()}
        />
      ) : marketQuery.isLoading ? (
        <div className="dm__grid">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="dm__skeleton" />)}
        </div>
      ) : items.length === 0 ? (
        <MarketEmptyState title="В этой категории пока пусто" message="Новые предметы появятся после обновления каталога." />
      ) : (
        <div className="dm__grid">
          {items.map((item) => {
            const ownedItem = ownedBySlug.get(item.slug);
            return (
              <MarketItemCard
                key={item.slug}
                item={item}
                owned={Boolean(ownedItem)}
                equipped={ownedItem ? equippedUserItemIds.has(ownedItem.user_item_id) : false}
                onOpen={setSelectedItem}
              />
            );
          })}
        </div>
      )}

      <section className="dm__ledger-hint">
        <span>Баланс</span>
        <strong>{formatSparks(balanceQuery.data?.balance)} ✦</strong>
      </section>

      <ItemDetailSheet
        item={selectedItem}
        ownedItem={selectedOwnedItem}
        equipped={selectedEquipped}
        balance={balanceQuery.data}
        hasAuth={hasAuth}
        actionPending={purchaseMutation.isPending || equipMutation.isPending || unequipMutation.isPending}
        equipBlockedReason={selectedEquipBlockedReason}
        onClose={() => setSelectedItem(null)}
        onBuy={(item) => setConfirmItem(item)}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
      />

      <PurchaseConfirmSheet
        item={confirmItem}
        previewAvatarUrl={confirmPreviewAvatarUrl}
        isPending={purchaseMutation.isPending}
        errorMessage={purchaseMutation.isError ? friendlyErrorMessage(purchaseMutation.error) : null}
        onCancel={() => setConfirmItem(null)}
        onConfirm={handlePurchaseConfirm}
      />

      <PurchaseSuccessModal
        result={success?.result ?? null}
        item={success?.item ?? null}
        canEquip={successCanEquip}
        isEquipping={equipMutation.isPending}
        onEquip={handleEquipSuccessItem}
        onInventory={onInventory}
        onContinue={() => setSuccess(null)}
      />
    </main>
  );
}

function resolveCurrentArchetype(slug?: string | null): ArchetypeId | null {
  return slug && slug in archetypeAssets ? (slug as ArchetypeId) : null;
}

function resolveFramePreviewArchetype(item: MarketItem, currentSlug?: string | null): ArchetypeId {
  if (currentSlug && currentSlug in archetypeAssets) return currentSlug as ArchetypeId;
  const recommended = item.metadata.recommended_for;
  if (Array.isArray(recommended)) {
    const first = recommended.find((slug): slug is ArchetypeId => typeof slug === "string" && slug in archetypeAssets);
    if (first) return first;
  }
  return "risk_manager";
}
