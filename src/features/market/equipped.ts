import type { EquippedItem, EquippedItemSlot } from "./types";
import {
  archetypeAssets,
  type ArchetypeAssets,
  type ArchetypeId,
  type ArchetypeMood,
} from "../../shared/assets/archetypeAssets";

export function getEquippedBySlot(
  equippedItems: EquippedItem[] | undefined,
  slot: EquippedItemSlot
): EquippedItem | null {
  return equippedItems?.find((item) => item.slot === slot) ?? null;
}

export function getEquippedProfileFrame(
  equippedItems: EquippedItem[] | undefined
): EquippedItem | null {
  return getEquippedBySlot(equippedItems, "profile_frame");
}

export function getEquippedShareCardTemplate(
  equippedItems: EquippedItem[] | undefined
): EquippedItem | null {
  return getEquippedBySlot(equippedItems, "share_card_template");
}

export function getEquippedRoomTheme(
  equippedItems: EquippedItem[] | undefined
): EquippedItem | null {
  return getEquippedBySlot(equippedItems, "room_theme");
}

export function getEquippedMemeSkin(
  equippedItems: EquippedItem[] | undefined
): EquippedItem | null {
  return getEquippedBySlot(equippedItems, "meme_skin");
}

export function getEquippedCharacterSkin(
  equippedItems: EquippedItem[] | undefined,
  archetypeId?: ArchetypeId | null
): EquippedItem | null {
  const skin = getEquippedBySlot(equippedItems, "character_skin");
  if (!skin) return null;
  if (!archetypeId) return skin;
  return characterSkinArchetype(skin.item.metadata) === archetypeId ? skin : null;
}

export function characterSkinArchetype(metadata: Record<string, unknown>): ArchetypeId | null {
  const raw = metadata.archetype;
  return typeof raw === "string" && raw in archetypeAssets ? (raw as ArchetypeId) : null;
}

export function characterSkinBlockedReason(
  metadata: Record<string, unknown>,
  currentArchetypeId?: ArchetypeId | null
): string | null {
  const skinArchetype = characterSkinArchetype(metadata);
  if (!skinArchetype) return null;
  if (!currentArchetypeId) return "Скин можно надеть после выбора персонажа.";
  if (skinArchetype !== currentArchetypeId) {
    return "Скин подходит только своему персонажу.";
  }
  return null;
}

export function getArchetypeAssetsWithSkin(
  archetypeId: ArchetypeId,
  equippedItems: EquippedItem[] | undefined
): ArchetypeAssets {
  const base = archetypeAssets[archetypeId];
  const skin = getEquippedCharacterSkin(equippedItems, archetypeId);
  if (!skin) return base;

  return {
    ...base,
    cutout: {
      ...base.cutout,
      fullNeutral: skinCutoutUrl(skin, "fullNeutral") ?? base.cutout.fullNeutral,
      neutral: skinCutoutUrl(skin, "neutral") ?? base.cutout.neutral,
      win: skinCutoutUrl(skin, "win") ?? base.cutout.win,
      rekt: skinCutoutUrl(skin, "rekt") ?? base.cutout.rekt,
    },
  };
}

export function getSkinCutoutOverrides(
  equippedItems: EquippedItem[] | undefined,
  archetypeId?: ArchetypeId | null
): Partial<Record<ArchetypeMood | "fullNeutral", string>> | null {
  if (!archetypeId) return null;
  const skin = getEquippedCharacterSkin(equippedItems, archetypeId);
  if (!skin) return null;
  return {
    fullNeutral: skinCutoutUrl(skin, "fullNeutral") ?? undefined,
    neutral: skinCutoutUrl(skin, "neutral") ?? undefined,
    win: skinCutoutUrl(skin, "win") ?? undefined,
    rekt: skinCutoutUrl(skin, "rekt") ?? undefined,
  };
}

function skinCutoutUrl(
  skin: EquippedItem,
  key: ArchetypeMood | "fullNeutral"
): string | null {
  const cutouts = cutoutMetadata(skin.item.metadata);
  const full = cutouts.fullNeutral ?? cutouts.full ?? skin.item.asset_url;
  const top = cutouts[key] ?? cutouts.neutral ?? skin.item.preview_asset_url ?? full;
  return key === "fullNeutral" ? full ?? top ?? null : top ?? null;
}

function cutoutMetadata(metadata: Record<string, unknown>): Record<string, string> {
  const raw = metadata.cutouts ?? metadata.skin_cutouts;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

export function getMarketItemClassToken(itemSlug?: string | null): string {
  if (!itemSlug) return "";
  return itemSlug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

export function equippedItemTitle(item: EquippedItem | null): string | null {
  return item?.item.title ?? null;
}
