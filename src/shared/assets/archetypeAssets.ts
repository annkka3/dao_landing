export type ArchetypeId =
  | "risk_manager"
  | "meme_degen"
  | "onchain_detective"
  | "leverage_cowboy"
  | "hodl_monk"
  | "airdrop_farmer"
  | "moon_prophet"
  | "capitulation_doomer";

export type ArchetypeMood = "neutral" | "win" | "rekt";

const a = (slug: string, versions: { cutoutWin?: string } = {}) => ({
  avatar: {
    sm: `/assets/archetypes/${slug}/avatar/avatar-64.webp`,
    md: `/assets/archetypes/${slug}/avatar/avatar-128.webp`,
    lg: `/assets/archetypes/${slug}/avatar/avatar-256.webp`,
  },
  hero: {
    neutral: `/assets/archetypes/${slug}/hero/neutral-1024.webp`,
    win:     `/assets/archetypes/${slug}/hero/win-1024.webp`,
    rekt:    `/assets/archetypes/${slug}/hero/rekt-1024.webp`,
  },
  card: {
    neutral: `/assets/archetypes/${slug}/card/neutral-768x1024.webp`,
    win:     `/assets/archetypes/${slug}/card/win-768x1024.webp`,
    rekt:    `/assets/archetypes/${slug}/card/rekt-768x1024.webp`,
  },
  cutout: {
    neutral: `/assets/archetypes/${slug}/cutout/neutral.webp`,
    win:     `/assets/archetypes/${slug}/cutout/win.webp${versions.cutoutWin ?? ""}`,
    rekt:    `/assets/archetypes/${slug}/cutout/rekt.webp`,
    fullNeutral: `/assets/archetypes/${slug}/cutout/full-neutral.webp?v=20260621-photoroom`,
  },
  background: `/assets/backgrounds/${slug}.webp`,
});

export const archetypeAssets = {
  risk_manager:        a("risk_manager"),
  meme_degen:          a("meme_degen"),
  onchain_detective:   a("onchain_detective"),
  leverage_cowboy:     a("leverage_cowboy", { cutoutWin: "?v=20260620-green" }),
  hodl_monk:           a("hodl_monk"),
  airdrop_farmer:      a("airdrop_farmer"),
  moon_prophet:        a("moon_prophet"),
  capitulation_doomer: a("capitulation_doomer"),
} as const satisfies Record<
  ArchetypeId,
  {
    avatar: { sm: string; md: string; lg: string };
    hero: Record<ArchetypeMood, string>;
    card: Record<ArchetypeMood, string>;
    cutout: Record<ArchetypeMood | "fullNeutral", string>;
    background: string;
  }
>;

export type ArchetypeAssets = (typeof archetypeAssets)[ArchetypeId];
