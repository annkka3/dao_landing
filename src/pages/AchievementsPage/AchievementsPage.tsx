import { useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getAchievements } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { friendlyErrorMessage } from "../../api/errorMessages";
import type { AchievementCategory, AchievementDTO, AchievementRarity } from "../../api/types";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import { iconForAchievement, RARITY_COLORS } from "../../shared/assets/achievementPresentation";
import "./AchievementsPage.css";

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  season: "Сезон",
  consistency: "Постоянство",
  risk: "Риск",
  archetype: "Архетип",
  comeback: "Камбэк",
  social: "Социальное",
};

const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: "Обычное",
  rare: "Редкое",
  epic: "Эпическое",
  legendary: "Легендарное",
};

type FilterId = "all" | AchievementCategory;

export interface AchievementsPageProps {
  onBack?: () => void;
}

export function AchievementsPage({ onBack }: AchievementsPageProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const { data, isLoading, isError, error } = useQuery({ queryKey: QK.achievements, queryFn: getAchievements });

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={friendlyErrorMessage(error, "Не удалось загрузить достижения.")}
        action={onBack && <button type="button" onClick={onBack}>Назад</button>}
      />
    );
  }

  const items = data.items;
  const earned = items.filter((a) => a.is_unlocked).length;
  const total = items.length;
  const filtered = filter === "all" ? items : items.filter((a) => a.category === filter);
  const categories = Array.from(new Set(items.map((a) => a.category)));
  const recent = items
    .filter((a): a is AchievementDTO & { unlocked_at: string } => a.is_unlocked && a.unlocked_at != null)
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 5);

  const circumference = 2 * Math.PI * 26;
  const pct = total > 0 ? earned / total : 0;
  const dashOffset = circumference * (1 - pct);

  return (
    <main className="ach">

      {/* ── Header ── */}
      <header className="ach__header">
        <div className="ach__header-row">
          <BrandHeader />
        </div>
      </header>

      <div className="ach__frame">

        {/* ── Title ── */}
        <div className="ach__title-row">
          <div className="ach__title-line" />
          <h1 className="ach__page-title">ACHIEVEMENTS</h1>
          <div className="ach__title-line" />
        </div>
        <p className="ach__page-sub">— ДОСТИЖЕНИЯ —</p>

        {/* ── Progress ── */}
        <div className="ach__player-card">
          <div className="ach__circle-progress">
            <div className="ach__circle-container">
              <svg className="ach__circle-svg" width="64" height="64" viewBox="0 0 64 64">
                <circle className="ach__circle-bg" cx="32" cy="32" r="26" strokeWidth="4" />
                <circle
                  className="ach__circle-fill"
                  cx="32" cy="32" r="26"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="ach__circle-text-wrap">
                <span className="ach__circle-val">{earned}/{total}</span>
                <span className="ach__circle-label">ОТКРЫТО</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="ach__filters">
          <button
            type="button"
            className={`ach__filter-btn${filter === "all" ? " ach__filter-btn--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`ach__filter-btn${filter === cat ? " ach__filter-btn--active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* ── Achievement grid ── */}
        <div className="ach__grid">
          {filtered.length === 0 ? (
            <p className="ach__card-desc">В этой категории пока ничего нет.</p>
          ) : (
            filtered.map((a) => <AchCard key={a.slug} achievement={a} />)
          )}
        </div>

        {/* ── Recent unlocks ── */}
        {recent.length > 0 && (
          <>
            <div className="ach__section-label">
              <div className="ach__section-line" />
              <span className="ach__section-text">ПОСЛЕДНИЕ ОТКРЫТИЯ</span>
              <div className="ach__section-line" />
            </div>
            <div className="ach__recent-card">
              {recent.map((a) => (
                <div key={a.slug} className="ach__recent-row">
                  <div className="ach__recent-info">
                    <span className="ach__recent-title" style={{ color: RARITY_COLORS[a.rarity] }}>{a.title}</span>
                    <span className="ach__recent-desc">{a.description}</span>
                  </div>
                  <div className="ach__recent-when">
                    <span className="ach__recent-day">{new Date(a.unlocked_at).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {onBack && (
          <button type="button" className="ach__profile-btn" onClick={onBack}>
            В ПРОФИЛЬ
          </button>
        )}

      </div>
    </main>
  );
}

/* ── Achievement card ── */
function AchCard({ achievement }: { achievement: AchievementDTO }) {
  const { title, description, category, rarity, is_unlocked, icon_key } = achievement;
  const color = RARITY_COLORS[rarity];
  const Icon = iconForAchievement(icon_key);

  return (
    <div
      className={`ach__card${is_unlocked ? " ach__card--unlocked" : ""}`}
      style={{ "--ach-color": color, borderColor: is_unlocked ? `${color}55` : undefined } as CSSProperties}
    >
      {!is_unlocked && <div className="ach__lock-icon"><LockIcon size={14} /></div>}
      <div className="ach__card-top">
        <div
          className="ach__hex-badge ach__hex-badge--sm"
          style={{ background: `${color}28`, opacity: is_unlocked ? 1 : 0.45 }}
        >
          <Icon size={20} />
        </div>
        <div className="ach__card-text">
          <span className="ach__card-title" style={{ color: is_unlocked ? color : "rgba(255,255,255,0.3)" }}>
            {title}
          </span>
          <span className="ach__card-desc">{description}</span>
        </div>
      </div>
      <div className="ach__card-footer">
        <div className="ach__card-meta">
          <span className="ach__category-badge">{CATEGORY_LABELS[category]}</span>
          <span
            className="ach__rarity-badge"
            style={{ color, borderColor: color, background: `${color}14` }}
          >
            {RARITY_LABELS[rarity]}
          </span>
        </div>
        {is_unlocked && <span className="ach__unlocked-badge">ОТКРЫТО</span>}
        {!is_unlocked && <span className="ach__locked-badge">ЗАКРЫТО</span>}
      </div>
    </div>
  );
}

function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
