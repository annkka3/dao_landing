import type { ArchetypeId } from "./archetypeAssets";

export const ARCHETYPE_ACCENTS: Record<ArchetypeId, string> = {
  risk_manager: "#3a8cff",
  meme_degen: "#b84dff",
  onchain_detective: "#00d4ff",
  leverage_cowboy: "#ffba00",
  hodl_monk: "#ffd23f",
  airdrop_farmer: "#22e6b3",
  moon_prophet: "#39ff14",
  capitulation_doomer: "#ff3b30",
};

export function archetypeAccentFor(slug: string | null | undefined): string {
  if (slug && slug in ARCHETYPE_ACCENTS) {
    return ARCHETYPE_ACCENTS[slug as ArchetypeId];
  }
  return ARCHETYPE_ACCENTS.risk_manager;
}
