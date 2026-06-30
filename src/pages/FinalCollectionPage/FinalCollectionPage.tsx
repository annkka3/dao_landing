import { useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFinalCollection } from "../../api/endpoints";
import type { FinalCollectionCardDTO } from "../../api/types";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { friendlyErrorMessage } from "../../api/errorMessages";
import { QK } from "../../store/queryClient";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import "./FinalCollectionPage.css";

const ARCH_NAMES: Record<ArchetypeId, { name: string; accent: string }> = {
  risk_manager:        { name: "Risk Manager",        accent: "#3a8cff" },
  meme_degen:          { name: "Meme Degen",           accent: "#b84dff" },
  onchain_detective:   { name: "On-chain Detective",   accent: "#00d4ff" },
  leverage_cowboy:     { name: "Leverage Cowboy",      accent: "#ffba00" },
  hodl_monk:           { name: "HODL Monk",            accent: "#ffd23f" },
  airdrop_farmer:      { name: "Airdrop Farmer",       accent: "#22e6b3" },
  moon_prophet:        { name: "Moon Prophet",         accent: "#39ff14" },
  capitulation_doomer: { name: "Capitulation Doomer",  accent: "#ff3b30" },
};

export interface FinalCollectionPageProps {
  onBack?: () => void;
}

export function FinalCollectionPage({ onBack }: FinalCollectionPageProps) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: QK.finalCollection,
    queryFn: getFinalCollection,
  });

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={friendlyErrorMessage(error, "Не удалось загрузить коллекцию финалов.")}
        action={onBack && <button type="button" onClick={onBack}>Назад</button>}
      />
    );
  }

  const orderedCards = data.items
    .map((card, index) => ({ card, seasonNumber: index + 1 }))
    .reverse();
  const visibleCards = expanded ? orderedCards : orderedCards.slice(0, 5);
  const hasMoreCards = orderedCards.length > 5;

  return (
    <main className="fcoll">
      <header className="fcoll__header">
        <div className="fcoll__header-row">
          <BrandHeader />
        </div>
      </header>

      <div className="fcoll__frame">
        <div className="fcoll__title-row">
          <div className="fcoll__title-line" />
          <h1 className="fcoll__page-title">FINAL COLLECTION</h1>
          <div className="fcoll__title-line" />
        </div>
        <p className="fcoll__page-sub">— КОЛЛЕКЦИЯ ФИНАЛОВ —</p>

        <section className="fcoll__intro-card">
          <div className="fcoll__intro-icon">
            <CardsIcon size={26} />
          </div>
          <div>
            <span className="fcoll__intro-title">{data.items.length} финальных карточек</span>
            <p className="fcoll__intro-text">
              После каждого сезона здесь сохраняется твоя история: титул, архетип,
              место, итоговый счёт, главный бонус и номинация DAO.
            </p>
          </div>
        </section>

        {data.items.length === 0 ? (
          <section className="fcoll__empty">
            <div className="fcoll__empty-icon"><LockIcon size={28} /></div>
            <h2>Коллекция пока пустая</h2>
            <p>Финальные карточки появятся после завершения первого сезона.</p>
          </section>
        ) : (
          <>
            <section className="fcoll__grid">
              {visibleCards.map(({ card, seasonNumber }) => (
                <FinalCollectionCard
                  key={card.id}
                  card={card}
                  seasonNumber={seasonNumber}
                />
              ))}
            </section>

            {hasMoreCards && (
              <button
                type="button"
                className="fcoll__toggle-btn"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? "СВЕРНУТЬ" : `ПОСМОТРЕТЬ ВСЕ · ${orderedCards.length}`}
              </button>
            )}
          </>
        )}

        {onBack && (
          <button type="button" className="fcoll__profile-btn" onClick={onBack}>
            В ПРОФИЛЬ
          </button>
        )}
      </div>
    </main>
  );
}

function FinalCollectionCard({
  card,
  seasonNumber,
}: {
  card: FinalCollectionCardDTO;
  seasonNumber: number;
}) {
  const archetypeId = isArchetypeId(card.archetype_slug) ? card.archetype_slug : null;
  const arch = archetypeId ? ARCH_NAMES[archetypeId] : undefined;
  const rank = rankPresentation(card.rank);
  const bonusText = card.main_bonus_title
    ? `${formatSigned(card.main_bonus_points ?? 0)} · ${card.main_bonus_title}`
    : "Главный бонус появится после финала";
  const nominationText = card.nomination_title ?? "Номинация DAO не назначена";

  return (
    <article
      className={`fcoll-card fcoll-card--${rank.tone}`}
      style={{ "--fc": arch?.accent ?? rank.color, "--rank": rank.color } as CSSProperties}
    >
      <div className="fcoll-card__bg" />
      <div className="fcoll-card__top">
        <span className="fcoll-card__season">СЕЗОН {seasonNumber}</span>
        <span className="fcoll-card__date">
          {new Date(card.finalized_at).toLocaleDateString("ru-RU")}
        </span>
      </div>

      <div className="fcoll-card__hero-row">
        <div className="fcoll-card__avatar-wrap">
          {archetypeId ? (
            <img
              className="fcoll-card__avatar"
              src={archetypeAssets[archetypeId].avatar.md}
              alt=""
            />
          ) : (
            <div className="fcoll-card__avatar fcoll-card__avatar--empty" />
          )}
        </div>
        <div className="fcoll-card__identity">
          <span className="fcoll-card__kicker">ФИНАЛЬНЫЙ ТИТУЛ</span>
          <h2>{card.final_title}</h2>
          <p>{card.final_title_description}</p>
        </div>
      </div>

      <div className="fcoll-card__stats">
        <div className="fcoll-card__stat">
          <span>АРХЕТИП</span>
          <strong>{arch?.name ?? "Не выбран"}</strong>
        </div>
        <div className="fcoll-card__stat">
          <span>МЕСТО</span>
          <strong style={{ color: rank.color }}>#{card.rank} / {card.total_players}</strong>
        </div>
        <div className="fcoll-card__stat">
          <span>SCORE</span>
          <strong>{formatSigned(card.score)}</strong>
        </div>
      </div>

      <div className="fcoll-card__details">
        <div className="fcoll-card__detail">
          <span>ГЛАВНЫЙ BONUS</span>
          <strong>{bonusText}</strong>
        </div>
        <div className="fcoll-card__detail">
          <span>НОМИНАЦИЯ</span>
          <strong>{nominationText}</strong>
        </div>
      </div>
    </article>
  );
}

function isArchetypeId(slug: string | null): slug is ArchetypeId {
  return Boolean(slug && slug in archetypeAssets);
}

function rankPresentation(rank: number): { tone: "first" | "second" | "third" | "all"; color: string } {
  if (rank === 1) return { tone: "first", color: "#ffd23f" };
  if (rank === 2) return { tone: "second", color: "#d6dde9" };
  if (rank === 3) return { tone: "third", color: "#cd7f32" };
  return { tone: "all", color: "#ffffff" };
}

function formatSigned(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function CardsIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3h9a3 3 0 0 1 3 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 10h6M7 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
