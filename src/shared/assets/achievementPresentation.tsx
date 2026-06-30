import type { AchievementRarity } from "../../api/types";

export type AchievementIcon = (p: { size?: number }) => JSX.Element;

export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: "#9ba5b7",
  rare: "#00e5ff",
  epic: "#a855f7",
  legendary: "#ffba00",
};

export const ICONS_BY_KEY: Record<string, AchievementIcon> = {
  calendar_check: CalendarCheckIcon,
  flag_check: FlagIcon,
  repeat: RepeatIcon,
  diamond: DiamondIcon,
  trophy: TrophyIcon,
  medal: MedalIcon,
  crown: CrownIcon,
  triple_crown: CrownIcon,
  podium: MedalIcon,
  rocket: RocketIcon,
  star_burst: StarBurstIcon,
  coins: CoinsIcon,
  vault: DiamondIcon,
  shield_check: ShieldCheckIcon,
  moon_star: MoonStarIcon,
  sparkles: SparklesIcon,
  checklist: ChecklistIcon,
  shield: ShieldCheckIcon,
  flame: FlameIcon,
  pulse: PulseIcon,
  arrow_up: ArrowUpIcon,
  phoenix: FlameIcon,
  radar: RadarIcon,
  snowflake: SnowflakeIcon,
  wallet: WalletIcon,
  reputation_star: StarBurstIcon,
  search: SearchIcon,
  lasso: LassoIcon,
  meme: MemeIcon,
  monk: MonkIcon,
  seedling: SeedlingIcon,
  moon: MoonStarIcon,
  doom: DoomIcon,
};

export function iconForAchievement(iconKey: string | null): AchievementIcon {
  return (iconKey ? ICONS_BY_KEY[iconKey] : undefined) ?? TrophyIcon;
}

/* ── Icons ── */

export function TrophyIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 21h8M12 17v4M17 3H7l1 10a4 4 0 0 0 8 0l1-10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 3H3v4a4 4 0 0 0 4 4M19 3h2v4a4 4 0 0 1-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CalendarCheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 15l2.2 2.2L16 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlagIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 21V4m0 0h10l-1 4 1 4H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiamondIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M8 3l-2 6 6 12 6-12-2-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function MedalIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3h8l-2 6h-4L8 3zM12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 14v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CrownIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7l5 4 4-7 4 7 5-4-2 11H5L3 7zM5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RocketIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 4c3-1 6 0 6 0s1 3 0 6c-1 4-5 7-8 8l-6-6c1-3 4-7 8-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 15l-4 4M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StarBurstIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.2 6.1L21 8l-5.4 4 2 6.5L12 14.6 6.4 18.5l2-6.5L3 8l6.8.1L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CoinsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="10" cy="6" rx="6" ry="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 6v8c0 1.7 2.7 3 6 3s6-1.3 6-3V6M8 12c1 .3 2.8.3 4 0M14 10c3.4.2 6 1.5 6 3 0 1.7-2.7 3-6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoonStarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 16.5A8 8 0 0 1 7.5 6 7 7 0 1 0 18 16.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M17 3l.7 1.6L19 5l-1.3.4L17 7l-.7-1.6L15 5l1.3-.4L17 3z" fill="currentColor" />
    </svg>
  );
}

function SparklesIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.4 5.2L18 9l-4.6 1.8L12 16l-1.4-5.2L6 9l4.6-1.8L12 2zM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ChecklistIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2s-7 5-7 12a7 7 0 0 0 14 0c0-4-3-7-3-7s0 3-2 4c0-3-2-9-2-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function PulseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RadarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 12l6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SnowflakeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v18M5 7l14 10M19 7L5 17M8 5l4 3 4-3M8 19l4-3 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l5 5M8 11h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LassoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="11" cy="8" rx="7" ry="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 11c2 2 3 4 2 6-1 2-4 3-7 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MemeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8h14M7 8l1-4h8l1 4M8 13h.01M16 13h.01M9 17c2 1 4 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8v5a6 6 0 0 0 12 0V8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function MonkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 21a7 7 0 0 1 14 0M7 14l-3 3M17 14l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SeedlingIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21V10M12 10C8 10 5 8 4 4c4 0 7 2 8 6zM12 10c4 0 7-2 8-6-4 0-7 2-8 6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DoomIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
