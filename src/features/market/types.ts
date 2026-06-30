export type MarketItemCategory =
  | "profile_frame"
  | "share_card_template"
  | "room_theme"
  | "character_skin"
  | "meme_item"
  | "meme_skin"
  | "sticker_pack"
  | "education_pack"
  | "access_pass"
  | "gift"
  | "dao_artifact"
  | "collectible";

export type MarketItemRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "genesis";

export type MarketItemStatus =
  | "draft"
  | "active"
  | "hidden"
  | "retired"
  | "sold_out";

export type EquippedItemSlot =
  | "profile_frame"
  | "share_card_template"
  | "room_theme"
  | "character_skin"
  | "meme_skin";

export type UserItemStatus =
  | "owned"
  | "equipped"
  | "listed"
  | "gifted"
  | "burned"
  | "expired"
  | "revoked";

export type MarketItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: MarketItemCategory;
  rarity: MarketItemRarity;
  price_sparks: number | null;
  status: MarketItemStatus;
  is_tradable: boolean;
  is_giftable: boolean;
  is_soulbound: boolean;
  is_limited: boolean;
  supply_limit: number | null;
  supply_sold: number;
  starts_at: string | null;
  ends_at: string | null;
  asset_url: string | null;
  preview_asset_url: string | null;
  metadata: Record<string, unknown>;
};

export type MarketItemsResponse = {
  items: MarketItem[];
  limit: number;
  offset: number;
  total: number;
};

export type SparksBalance = {
  balance: number;
  total_earned: number;
  total_spent: number;
};

export type SparksLedgerEntry = {
  id: string;
  amount: number;
  direction: "earn" | "spend" | "refund" | "burn" | "adjust" | "fee";
  source_type: string;
  source_id: string | null;
  reason: string;
  balance_before: number;
  balance_after: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type SparksLedgerResponse = {
  items: SparksLedgerEntry[];
  limit: number;
  offset: number;
};

export type InventoryMarketItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: MarketItemCategory;
  rarity: MarketItemRarity;
  price_sparks: number | null;
  asset_url: string | null;
  preview_asset_url: string | null;
  metadata: Record<string, unknown>;
};

export type UserInventoryItem = {
  user_item_id: string;
  item: InventoryMarketItem;
  status: UserItemStatus;
  acquired_source: string;
  acquired_source_id: string | null;
  acquired_at: string;
  locked_until: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
};

export type UserInventoryResponse = {
  items: UserInventoryItem[];
  limit: number;
  offset: number;
  total: number;
};

export type EquippedItem = {
  id: string;
  slot: EquippedItemSlot;
  user_item_id: string;
  item: InventoryMarketItem;
  equipped_at: string;
  metadata: Record<string, unknown>;
};

export type EquippedItemsResponse = {
  items: EquippedItem[];
};

export type MarketPurchaseResult = {
  purchase_id: string;
  status: "completed";
  balance_before: number;
  balance_after: number;
  price_sparks: number;
  item: {
    id?: string;
    slug: string;
    title?: string;
    category?: MarketItemCategory;
    rarity?: MarketItemRarity;
    asset_url?: string | null;
    preview_asset_url?: string | null;
    metadata?: Record<string, unknown>;
  };
  user_item: {
    user_item_id?: string;
    status: UserItemStatus;
    acquired_source: string;
    acquired_at?: string;
  };
  ledger_entry_id?: string;
};

export type EquipItemResult = {
  equipped: EquippedItem;
  replaced_user_item_id: string | null;
};

export type UnequipItemResult = {
  slot: EquippedItemSlot;
  user_item_id: string | null;
  removed: boolean;
};
