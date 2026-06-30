import type {
  EquippedItemSlot,
  InventoryMarketItem,
  MarketItem,
  MarketItemCategory,
  MarketItemRarity,
} from "./types";

export type MarketTabKey =
  | "all"
  | "profile_frame"
  | "share_card_template"
  | "room_theme"
  | "character_skin"
  | "meme"
  | "education_pack"
  | "access_pass";

export const MARKET_TABS: Array<{ key: MarketTabKey; label: string }> = [
  { key: "all", label: "Все" },
  { key: "profile_frame", label: "Frames" },
  { key: "share_card_template", label: "Share Cards" },
  { key: "room_theme", label: "Rooms" },
  { key: "character_skin", label: "Skins" },
  { key: "meme", label: "Meme" },
  { key: "education_pack", label: "Education" },
  { key: "access_pass", label: "Access" },
];

export const SUPPORTED_EQUIP_SLOTS = [
  "profile_frame",
  "share_card_template",
  "room_theme",
  "character_skin",
  "meme_skin",
] as const satisfies readonly EquippedItemSlot[];

const EQUIP_SLOT_SET = new Set<string>(SUPPORTED_EQUIP_SLOTS);

export const CATEGORY_LABELS: Record<MarketItemCategory, string> = {
  profile_frame: "Profile Frame",
  share_card_template: "Share Card",
  room_theme: "Room Theme",
  character_skin: "Character Skin",
  meme_item: "Meme Item",
  meme_skin: "Meme Skin",
  sticker_pack: "Sticker Pack",
  education_pack: "Education",
  access_pass: "Access",
  gift: "Gift",
  dao_artifact: "DAO Artifact",
  collectible: "Collectible",
};

export const SLOT_LABELS: Record<EquippedItemSlot, string> = {
  profile_frame: "Profile Frame",
  share_card_template: "Share Card",
  room_theme: "Room Theme",
  character_skin: "Character Skin",
  meme_skin: "Meme Skin",
};

export const RARITY_LABELS: Record<MarketItemRarity, string> = {
  common: "Обычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный",
  genesis: "Genesis",
};

export function getEquippableSlot(item: MarketItem | InventoryMarketItem): EquippedItemSlot | null {
  if (item.metadata.catalog_only_until_assets === true) return null;

  const metadataSlot = item.metadata.slot;
  if (typeof metadataSlot === "string" && EQUIP_SLOT_SET.has(metadataSlot)) {
    return metadataSlot as EquippedItemSlot;
  }
  if (
    item.category === "profile_frame" ||
    item.category === "share_card_template" ||
    item.category === "room_theme" ||
    item.category === "character_skin" ||
    item.category === "meme_skin"
  ) {
    return item.category;
  }
  return null;
}

export function tabMatchesCategory(tab: MarketTabKey, category: MarketItemCategory): boolean {
  if (tab === "all") return true;
  if (tab === "meme") return category === "meme_item" || category === "meme_skin";
  return category === tab;
}

export function formatSparks(value: number | null | undefined): string {
  if (value == null) return "—";
  return Math.round(value).toLocaleString("ru-RU");
}

export function futureUseLabels(metadata: Record<string, unknown>): string[] {
  const raw = metadata.future_use;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string").slice(0, 5);
}
