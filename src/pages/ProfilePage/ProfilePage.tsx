import { useEffect, useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { iconForAchievement, RARITY_COLORS } from "../../shared/assets/achievementPresentation";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { useAppContext } from "../../store/AppContext";
import { getAchievements, getFinalCollection, getGameState, getProfileSummary } from "../../api/endpoints";
import {
  getArchetypeAssetsWithSkin,
  getEquippedMemeSkin,
  getEquippedRoomTheme,
} from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import type { StatsDTO } from "../../api/types";
import { QK } from "../../store/queryClient";
import "./ProfilePage.css";

const ARCH_INFO: Record<ArchetypeId, { name: string; accent: string }> = {
  risk_manager:        { name: "Risk Manager",        accent: "#3a8cff" },
  meme_degen:          { name: "Meme Degen",           accent: "#b84dff" },
  onchain_detective:   { name: "On-chain Detective",   accent: "#00d4ff" },
  leverage_cowboy:     { name: "Leverage Cowboy",      accent: "#ffba00" },
  hodl_monk:           { name: "HODL Monk",            accent: "#ffd23f" },
  airdrop_farmer:      { name: "Airdrop Farmer",       accent: "#22e6b3" },
  moon_prophet:        { name: "Moon Prophet",         accent: "#39ff14" },
  capitulation_doomer: { name: "Capitulation Doomer",  accent: "#ff3b30" },
};

export interface ProfilePageProps {
  onSettings?: () => void;
  onAchievements?: () => void;
  onFinalCollection?: () => void;
  onDaoMarket?: () => void;
  onInventory?: () => void;
  onStats?: () => void;
  onRiskGuardian?: () => void;
}

const STAT_FIELDS: Array<{
  key: keyof StatsDTO;
  label: string;
  color: string;
  Icon: (p: { size?: number }) => JSX.Element;
}> = [
  { key: "bankroll",    label: "Банкролл",   color: "#22c55e", Icon: CoinIcon },
  { key: "reputation",  label: "Репутация",  color: "#3882f6", Icon: StarIcon },
  { key: "alpha",       label: "Альфа",      color: "#ffd23f", Icon: AlphaIcon },
  { key: "stress",      label: "Стресс",     color: "#ef4444", Icon: HeartIcon },
  { key: "fomo",        label: "FOMO",       color: "#ff2ed6", Icon: FlameIcon },
  { key: "discipline",  label: "Дисциплина", color: "#00e5ff", Icon: TargetIcon },
  { key: "degen_index", label: "Degen Index", color: "#a855f7", Icon: SkullIcon },
];

// Scattered twinkle positions around the hero character — approximate, not
// tied to specific art details, reuses the same technique as the Room screen.
const HERO_PARTICLES: Array<{ left: number; top: number; duration: number; delay: number; tone: "ua" | "gold" }> = [
  { left: 10, top: 14, duration: 2.4, delay: 0, tone: "gold" },
  { left: 86, top: 10, duration: 2.9, delay: 0.5, tone: "ua" },
  { left: 6, top: 38, duration: 3.2, delay: 1.1, tone: "ua" },
  { left: 90, top: 30, duration: 2.1, delay: 0.2, tone: "gold" },
  { left: 14, top: 60, duration: 2.7, delay: 1.6, tone: "gold" },
  { left: 84, top: 52, duration: 3.0, delay: 0.8, tone: "ua" },
  { left: 8, top: 78, duration: 2.3, delay: 2.0, tone: "ua" },
  { left: 92, top: 70, duration: 2.6, delay: 0.4, tone: "gold" },
  { left: 18, top: 22, duration: 3.1, delay: 1.4, tone: "ua" },
  { left: 80, top: 16, duration: 2.5, delay: 1.9, tone: "gold" },
  { left: 4, top: 90, duration: 2.8, delay: 0.7, tone: "gold" },
  { left: 94, top: 86, duration: 2.2, delay: 1.2, tone: "ua" },
];

export function ProfilePage({
  onSettings,
  onAchievements,
  onFinalCollection,
  onDaoMarket,
  onInventory,
  onStats,
  onRiskGuardian,
}: ProfilePageProps) {
  const { state } = useAppContext();
  const user = state.user;
  const [heroTapped, setHeroTapped] = useState(false);
  const [statsFilled, setStatsFilled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setStatsFilled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { data: gameState } = useQuery({ queryKey: QK.gameState, queryFn: getGameState });
  const { data: achievementsData } = useQuery({ queryKey: QK.achievements, queryFn: getAchievements });
  const { data: finalCollectionData } = useQuery({
    queryKey: QK.finalCollection,
    queryFn: getFinalCollection,
  });
  const { data: equippedItemsData } = useEquippedItems();
  const { data: profileSummary } = useQuery({
    queryKey: QK.profileSummary,
    queryFn: getProfileSummary,
  });

  const participant = gameState?.participant;
  const archetypeId = (participant?.archetype_slug ?? undefined) as ArchetypeId | undefined;
  const arch = archetypeId ? ARCH_INFO[archetypeId] : undefined;
  const equippedItems = equippedItemsData?.items ?? [];
  const profileAssets = archetypeId ? getArchetypeAssetsWithSkin(archetypeId, equippedItems) : undefined;
  const favoriteArchetypeId = (profileSummary?.favorite_archetype?.slug ?? undefined) as ArchetypeId | undefined;
  const favoriteArch = favoriteArchetypeId ? ARCH_INFO[favoriteArchetypeId] : undefined;
  const earned = achievementsData?.items.filter((a) => a.is_unlocked).length ?? 0;
  const total = achievementsData?.items.length ?? 0;
  const recentAchievements = (achievementsData?.items ?? [])
    .filter((a): a is typeof a & { unlocked_at: string } => a.is_unlocked && a.unlocked_at != null)
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 6);
  const achievementSlots = Array.from({ length: 6 }, (_, index) => recentAchievements[index] ?? null);
  const finalCards = finalCollectionData?.items ?? [];
  const recentFinalCards = finalCards.slice(-3).reverse();
  const displayName = user?.username ? `@${user.username}` : user?.first_name ?? "Игрок";
  const memeSkin = getEquippedMemeSkin(equippedItems);
  const roomTheme = getEquippedRoomTheme(equippedItems);
  const profileBackgroundSrc =
    roomTheme?.item.asset_url ?? roomTheme?.item.preview_asset_url ?? profileAssets?.background;

  return (
    <main className="prof">

      {/* ── Header ── */}
      <header className="prof__header">
        <div className="prof__brand-row">
          <BrandHeader />
        </div>
        <div className="prof__title-row">
          <div className="prof__title-line" />
          <h1 className="prof__page-title">PROFILE</h1>
          <div className="prof__title-line" />
        </div>
        <p className="prof__page-sub">— ПРОФИЛЬ —</p>
      </header>

      <div className="prof__frame">

        {/* ── User hero ── */}
        <div
          className={`prof__user-hero${profileAssets ? "" : " prof__user-hero--empty"}`}
          style={arch ? ({ "--ua": arch.accent } as CSSProperties) : undefined}
          onClick={() => profileAssets && setHeroTapped(true)}
        >
          {profileAssets && (
            <>
              {profileBackgroundSrc && <img className="prof__user-hero-bg" src={profileBackgroundSrc} alt="" />}
              <div className="prof__user-hero-scan" />
              <div className="prof__user-hero-bg-fade" />
              <div className="prof__user-hero-glow" />
              {HERO_PARTICLES.map((p, i) => (
                <span
                  key={i}
                  className={`prof__hero-particle prof__hero-particle--${p.tone}`}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                  }}
                />
              ))}
              <img
                className={`prof__user-hero-character${heroTapped ? " prof__user-hero-character--tapped" : ""}`}
                src={profileAssets.cutout.fullNeutral}
                alt=""
                onAnimationEnd={(e) => {
                  if (e.animationName === "prof-hero-tap") setHeroTapped(false);
                }}
              />
            </>
          )}

          <div className="prof__user-hero-overlay" />

          <div className="prof__user-hero-info">
            <span className="prof__user-hero-name">{displayName}</span>
            {arch ? (
              <div className="prof__user-hero-arch">
                <ShieldIcon size={15} />
                {arch.name}
              </div>
            ) : (
              <span className="prof__user-hero-muted">Сейчас нет активной игры</span>
            )}
          </div>
        </div>

        <button className="prof__inventory-quick" type="button" onClick={onInventory}>
          <span className="prof__inventory-quick-icon" aria-hidden="true">⬡</span>
          <span className="prof__inventory-quick-copy">
            <strong>ИНВЕНТАРЬ</strong>
            <small>Рамки, темы, карточки и скины</small>
          </span>
          <ChevronRightIcon size={16} />
        </button>

        <button className="prof__inventory-quick prof__inventory-quick--risk" type="button" onClick={onRiskGuardian}>
          <span className="prof__inventory-quick-icon" aria-hidden="true">◇</span>
          <span className="prof__inventory-quick-copy">
            <strong>RISK GUARDIAN</strong>
            <small>Бюджет риска, чеклист и журнал сделок</small>
          </span>
          <ChevronRightIcon size={16} />
        </button>

        {/* ── Season summary ── */}
        <div className="prof__summary-card">
          <ProfileSummaryStat
            icon={<CalendarIcon size={20} />}
            label="Сыграно сезонов"
            value={profileSummary?.seasons_played ?? 0}
            color="#b84dff"
          />
          <div className="prof__stat-divider" />
          <ProfileSummaryStat
            icon={<TrophyIcon size={20} />}
            label="Лучший ранг"
            value={profileSummary?.best_rank ? `#${profileSummary.best_rank}` : "—"}
            color="#8cff66"
          />
          <div className="prof__stat-divider" />
          <ProfileSummaryStat
            icon={<VictoryIcon size={20} />}
            label="Побед"
            value={profileSummary?.wins_count ?? 0}
            color="#00d4ff"
          />
          <div className="prof__stat-divider" />
          <ProfileSummaryStat
            icon={<StarIcon size={20} />}
            label="Общий счёт"
            value={formatScore(profileSummary?.total_score ?? 0)}
            color="#ffba00"
          />
        </div>

        {/* ── Favorite archetype ── */}
        <div
          className="prof__favorite-card"
          style={favoriteArch ? ({ "--fa": favoriteArch.accent } as CSSProperties) : undefined}
        >
          <span className="prof__favorite-label">ЛЮБИМЫЙ АРХЕТИП</span>
          <div className="prof__favorite-body">
            {favoriteArchetypeId ? (
              <img
                className="prof__favorite-avatar"
                src={archetypeAssets[favoriteArchetypeId].avatar.md}
                alt=""
              />
            ) : (
              <div className="prof__favorite-avatar prof__favorite-avatar--empty" />
            )}
            <div className="prof__favorite-info">
              <span className="prof__favorite-name">
                {favoriteArch ? favoriteArch.name : "Пока нет"}
              </span>
              <span className="prof__favorite-sub">
                {profileSummary?.favorite_archetype
                  ? `Выбран в ${profileSummary.favorite_archetype.seasons} сезонах`
                  : "Появится после завершения сезона"}
              </span>
            </div>
          </div>
        </div>

        <div className="market-meme-card">
          <div className="market-meme-card__icon" aria-hidden="true">✧</div>
          <div className="market-meme-card__copy">
            <strong>{memeSkin ? "Meme Skin применён" : "Meme Skin не применён"}</strong>
            <span>
              {memeSkin
                ? `${memeSkin.item.title}. Визуальная прокачка meme-компаньона будет подключена позже.`
                : "Визуальная прокачка meme-компаньона будет подключена позже."}
            </span>
          </div>
        </div>

        {/* ── Current game stats ── */}
        {participant && (
          <div className="prof__game-stats-card">
            <div className="prof__game-stats-header">
              <span className="prof__section-title">ТВОИ ПОКАЗАТЕЛИ</span>
              <button className="prof__detail-btn" type="button" onClick={onStats}>
                ПОДРОБНЕЕ <ChevronRightIcon size={13} />
              </button>
            </div>
            <div className="prof__game-stats-list">
              {STAT_FIELDS.map(({ key, label, color, Icon }) => {
                const value = participant.stats[key];
                const pct = Math.min(100, Math.max(0, value));
                return (
                  <div key={key} className="prof__game-stat-row">
                    <span className="prof__game-stat-icon" style={{ color }}>
                      <Icon size={15} />
                    </span>
                    <span className="prof__game-stat-label">{label}</span>
                    <div className="prof__game-stat-bar-wrap">
                      <div
                        className="prof__game-stat-bar-fill"
                        style={{
                          width: `${statsFilled ? pct : 0}%`,
                          background: color,
                          boxShadow: `0 0 6px ${color}`,
                        } as CSSProperties}
                      />
                      <span
                        className="prof__game-stat-bar-tip"
                        style={{
                          left: `${statsFilled ? pct : 0}%`,
                          background: color,
                          boxShadow: `0 0 6px ${color}, 0 0 2px ${color}`,
                          opacity: statsFilled ? 1 : 0,
                        } as CSSProperties}
                      />
                    </div>
                    <span className="prof__game-stat-value" style={{ color }}>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Achievements ── */}
        <div className="prof__ach-card">
          <div className="prof__ach-header">
            <span className="prof__section-title">ДОСТИЖЕНИЯ</span>
            <button className="prof__ach-count" type="button" onClick={onAchievements}>
              {earned} / {total}
              <ChevronRightIcon size={15} />
            </button>
          </div>
          <div className="prof__ach-badges">
            {achievementSlots.map((a, index) => {
              if (!a) {
                return (
                  <button
                    key={`empty-${index}`}
                    type="button"
                    className="prof__ach-badge prof__ach-badge--empty"
                    onClick={onAchievements}
                    aria-label="Закрытое достижение"
                    title="Закрытое достижение"
                  >
                    <LockMiniIcon size={15} />
                  </button>
                );
              }

              const Icon = iconForAchievement(a.icon_key);
              const color = RARITY_COLORS[a.rarity];
              return (
                  <button
                    key={a.slug}
                    type="button"
                    className="prof__ach-badge"
                    style={{ "--ach-color": color } as CSSProperties}
                    onClick={onAchievements}
                    aria-label={a.title}
                    title={a.title}
                  >
                    <Icon size={18} />
                  </button>
              );
            })}
          </div>
        </div>

        {/* ── Final collection ── */}
        <button className="prof__final-collection-card" type="button" onClick={onFinalCollection}>
          <div className="prof__final-collection-header">
            <div>
              <span className="prof__section-title">КОЛЛЕКЦИЯ ФИНАЛОВ</span>
              <span className="prof__final-collection-sub">Финальные карточки сезонов</span>
            </div>
            <span className="prof__final-collection-count">
              {finalCards.length}
              <ChevronRightIcon size={15} />
            </span>
          </div>
          <div className="prof__final-collection-preview">
            {Array.from({ length: 3 }, (_, index) => {
              const card = recentFinalCards[index];
              if (!card) {
                return (
                  <div key={`empty-final-${index}`} className="prof__final-mini prof__final-mini--empty">
                    <TrophyIcon size={20} />
                    <span>СЕЗОН</span>
                  </div>
                );
              }

              const cardArchetype = isArchetypeId(card.archetype_slug) ? card.archetype_slug : null;
              const cardArch = cardArchetype ? ARCH_INFO[cardArchetype] : undefined;
              return (
                <div
                  key={card.id}
                  className={`prof__final-mini prof__final-mini--rank-${rankTone(card.rank)}`}
                  style={{ "--fc": cardArch?.accent ?? rankColor(card.rank) } as CSSProperties}
                >
                  {cardArchetype && (
                    <img
                      className="prof__final-mini-avatar"
                      src={archetypeAssets[cardArchetype].avatar.sm}
                      alt=""
                    />
                  )}
                  <span className="prof__final-mini-rank">#{card.rank}</span>
                  <span className="prof__final-mini-score">{formatSignedScore(card.score)}</span>
                </div>
              );
            })}
          </div>
        </button>

        {/* ── Action buttons ── */}
        <div className="prof__market-actions">
          <button className="prof__market-btn prof__market-btn--primary" type="button" onClick={onDaoMarket}>
            <span>DAO MARKET</span>
            <small>Потратить Искры</small>
          </button>
          <button className="prof__market-btn" type="button" onClick={onInventory}>
            <span>ИНВЕНТАРЬ</span>
            <small>Надеть предметы</small>
          </button>
        </div>

        <button className="prof__settings-btn-wide" type="button" onClick={onSettings}>
          <GearIcon size={18} /> НАСТРОЙКИ
        </button>

      </div>
    </main>
  );
}

function formatScore(value: number): string {
  return Math.round(value).toLocaleString("ru-RU");
}

function formatSignedScore(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function rankTone(rank: number): "first" | "second" | "third" | "all" {
  if (rank === 1) return "first";
  if (rank === 2) return "second";
  if (rank === 3) return "third";
  return "all";
}

function rankColor(rank: number): string {
  if (rank === 1) return "#ffd23f";
  if (rank === 2) return "#d6dde9";
  if (rank === 3) return "#cd7f32";
  return "#00e5ff";
}

function isArchetypeId(slug: string | null): slug is ArchetypeId {
  return Boolean(slug && slug in archetypeAssets);
}

function ProfileSummaryStat({
  icon,
  label,
  value,
  color,
}: {
  icon: JSX.Element;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="prof__summary-stat" style={{ "--ss": color } as CSSProperties}>
      <span className="prof__summary-icon">{icon}</span>
      <span className="prof__summary-label">{label}</span>
      <span className="prof__summary-value">{value}</span>
    </div>
  );
}

/* ── Icons ── */

function GearIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 14h2M14 14h2M8 17h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 6H5a2 2 0 0 0 0 4h1.5M16 6h3a2 2 0 0 1 0 4h-1.5M12 13v4M9 21h6M8 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VictoryIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 12V4.5a1.5 1.5 0 0 1 3 0V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 12V7.5a1.5 1.5 0 0 1 3 0V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 13l-1.8-1.8a1.55 1.55 0 0 0-2.2 2.2l3.4 3.4A7 7 0 0 0 12.35 19H13a4 4 0 0 0 4-4v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockMiniIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AlphaIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 20l4-8 4 4 4-10 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CoinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v2m0 6v2m-1.5-8h2.5a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 14c0-3 3-5 3-8 0 0 3 2 3 6 0 0 1.5-1 1.5-3 2 2 2 4 2 5a6 6 0 0 1-12 0c0-2 1-4 2.5-5C8.5 11 8.5 12.5 8.5 14z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function SkullIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.83 1.18 5.38 3.08 7.17V19a1 1 0 0 0 1 1h9.84a1 1 0 0 0 1-1v-.83C19.82 17.38 21 14.83 21 12c0-4.97-4.03-9-9-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 17v1M12 17v1M15 17v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
