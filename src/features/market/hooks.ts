import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTelegramInitData } from "../../telegram/webapp";
import {
  equipInventoryItem,
  getEquippedItems,
  getMarketItem,
  getMarketItems,
  getSparksBalance,
  getSparksLedger,
  getUserInventory,
  getUserInventoryItem,
  purchaseMarketItem,
  unequipInventoryItem,
  unequipSlot,
} from "./api";
import type {
  MarketItemCategory,
  MarketItemRarity,
  UserItemStatus,
} from "./types";

export const marketKeys = {
  sparksBalance: ["sparks", "balance"] as const,
  sparksLedger: (limit?: number, offset?: number) => ["sparks", "ledger", limit, offset] as const,
  marketItems: (filters: unknown) => ["market", "items", filters] as const,
  marketItem: (slug: string) => ["market", "item", slug] as const,
  inventory: (filters: unknown) => ["inventory", filters] as const,
  inventoryItem: (userItemId: string) => ["inventory", "item", userItemId] as const,
  equippedItems: ["equipped-items"] as const,
};

export function useSparksBalance(enabled = true) {
  return useQuery({
    queryKey: marketKeys.sparksBalance,
    queryFn: getSparksBalance,
    enabled,
  });
}

export function useSparksLedger(params?: { limit?: number; offset?: number }, enabled = true) {
  return useQuery({
    queryKey: marketKeys.sparksLedger(params?.limit, params?.offset),
    queryFn: () => getSparksLedger(params),
    enabled,
  });
}

export function useMarketItems(
  filters?: {
    category?: MarketItemCategory | "all";
    rarity?: MarketItemRarity;
    status?: "active" | "sold_out";
    limit?: number;
    offset?: number;
  },
  enabled = true
) {
  return useQuery({
    queryKey: marketKeys.marketItems(filters ?? {}),
    queryFn: () => getMarketItems(filters),
    enabled,
  });
}

export function useMarketItem(slug: string | null, enabled = true) {
  return useQuery({
    queryKey: marketKeys.marketItem(slug ?? ""),
    queryFn: () => getMarketItem(slug ?? ""),
    enabled: enabled && Boolean(slug),
  });
}

export function useUserInventory(
  filters?: {
    category?: MarketItemCategory | "all";
    status?: UserItemStatus;
    limit?: number;
    offset?: number;
  },
  enabled = true
) {
  return useQuery({
    queryKey: marketKeys.inventory(filters ?? {}),
    queryFn: () => getUserInventory(filters),
    enabled,
  });
}

export function useUserInventoryItem(userItemId: string | null, enabled = true) {
  return useQuery({
    queryKey: marketKeys.inventoryItem(userItemId ?? ""),
    queryFn: () => getUserInventoryItem(userItemId ?? ""),
    enabled: enabled && Boolean(userItemId),
  });
}

export function useEquippedItems(enabled = true) {
  const hasAuth = Boolean(getTelegramInitData());
  return useQuery({
    queryKey: marketKeys.equippedItems,
    queryFn: getEquippedItems,
    enabled: enabled && hasAuth,
  });
}

export function usePurchaseMarketItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemSlug, idempotencyKey }: { itemSlug: string; idempotencyKey: string }) =>
      purchaseMarketItem(itemSlug, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sparks", "balance"] });
      void queryClient.invalidateQueries({ queryKey: ["sparks", "ledger"] });
      void queryClient.invalidateQueries({ queryKey: ["inventory"] });
      void queryClient.invalidateQueries({ queryKey: ["market", "items"] });
    },
  });
}

export function useEquipInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: equipInventoryItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: marketKeys.equippedItems });
      void queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUnequipInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unequipInventoryItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: marketKeys.equippedItems });
      void queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUnequipSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unequipSlot,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: marketKeys.equippedItems });
      void queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
