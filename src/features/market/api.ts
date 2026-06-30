import { apiFetch } from "../../api/client";
import type {
  EquippedItemSlot,
  EquippedItemsResponse,
  EquipItemResult,
  MarketItem,
  MarketItemCategory,
  MarketItemRarity,
  MarketItemsResponse,
  MarketPurchaseResult,
  SparksBalance,
  SparksLedgerResponse,
  UnequipItemResult,
  UserInventoryItem,
  UserInventoryResponse,
  UserItemStatus,
} from "./types";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const raw = query.toString();
  return raw ? `?${raw}` : "";
}

export function getSparksBalance(): Promise<SparksBalance> {
  return apiFetch<SparksBalance>("/users/sparks");
}

export function getSparksLedger(params?: {
  limit?: number;
  offset?: number;
}): Promise<SparksLedgerResponse> {
  return apiFetch<SparksLedgerResponse>(
    `/users/sparks/ledger${buildQuery({ limit: params?.limit, offset: params?.offset })}`
  );
}

export function getMarketItems(params?: {
  category?: MarketItemCategory | "all";
  rarity?: MarketItemRarity;
  status?: "active" | "sold_out";
  limit?: number;
  offset?: number;
}): Promise<MarketItemsResponse> {
  return apiFetch<MarketItemsResponse>(
    `/market/items${buildQuery({
      category: params?.category === "all" ? undefined : params?.category,
      rarity: params?.rarity,
      status: params?.status,
      limit: params?.limit,
      offset: params?.offset,
    })}`
  );
}

export function getMarketItem(slug: string): Promise<MarketItem> {
  return apiFetch<MarketItem>(`/market/items/${encodeURIComponent(slug)}`);
}

export function purchaseMarketItem(
  itemSlug: string,
  idempotencyKey: string
): Promise<MarketPurchaseResult> {
  return apiFetch<MarketPurchaseResult>("/market/purchase", {
    method: "POST",
    body: JSON.stringify({ item_slug: itemSlug }),
    idempotencyKey,
  });
}

export function getUserInventory(params?: {
  category?: MarketItemCategory | "all";
  status?: UserItemStatus;
  limit?: number;
  offset?: number;
}): Promise<UserInventoryResponse> {
  return apiFetch<UserInventoryResponse>(
    `/users/inventory${buildQuery({
      category: params?.category === "all" ? undefined : params?.category,
      status: params?.status,
      limit: params?.limit,
      offset: params?.offset,
    })}`
  );
}

export function getUserInventoryItem(userItemId: string): Promise<UserInventoryItem> {
  return apiFetch<UserInventoryItem>(`/users/inventory/${encodeURIComponent(userItemId)}`);
}

export function getEquippedItems(): Promise<EquippedItemsResponse> {
  return apiFetch<EquippedItemsResponse>("/users/equipped-items");
}

export function equipInventoryItem(userItemId: string): Promise<EquipItemResult> {
  return apiFetch<EquipItemResult>(`/users/inventory/${encodeURIComponent(userItemId)}/equip`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function unequipInventoryItem(userItemId: string): Promise<UnequipItemResult> {
  return apiFetch<UnequipItemResult>(
    `/users/inventory/${encodeURIComponent(userItemId)}/unequip`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export function unequipSlot(slot: EquippedItemSlot): Promise<UnequipItemResult> {
  return apiFetch<UnequipItemResult>(`/users/equipped-items/${slot}/unequip`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

