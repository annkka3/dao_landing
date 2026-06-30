import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import type { ArchetypeId } from "../../shared/assets/archetypeAssets";
import { archetypeAccentFor } from "../../shared/assets/archetypePresentation";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getDailyResult, getGameState } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { EVENT_TYPE_LABELS, allEventsResolved, findEvent } from "../../features/game/gameState";
import type { EventType, StatsDTO, SubmitChoiceResponse } from "../../api/types";
import { notifyError, notifyInfo, notifySuccess } from "../../shared/notifications/notify";
import { shareGameCard } from "../../shared/shareCards/shareGameCard";
import { getArchetypeAssetsWithSkin, getSkinCutoutOverrides } from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import "./ChoiceResultPage.css";

const STAT_PRESENTATION: Record<keyof StatsDTO, { label: string; color: string; Icon: (p: { size?: number }) => JSX.Element }> = {
  bankroll:    { label: "БАНКРОЛЛ",    color: "#22c55e", Icon: CoinIcon },
  discipline:  { label: "ДИСЦИПЛИНА",  color: "#00e5ff", Icon: TargetIcon },
  fomo:        { label: "FOMO",        color: "#ff2ed6", Icon: FlameIcon },
  reputation:  { label: "РЕПУТАЦИЯ",   color: "#3882f6", Icon: StarIcon },
  alpha:       { label: "АЛЬФА",       color: "#ffd23f", Icon: AlphaIcon },
  stress:      { label: "СТРЕСС",      color: "#ef4444", Icon: HeartIcon },
  degen_index: { label: "DEGEN INDEX", color: "#a855f7", Icon: SkullIcon },
};

export interface ChoiceResultPageProps {
  result?: SubmitChoiceResponse | null;
  onContinue?: () => void;
  onDayReview?: () => void;
}

export function ChoiceResultPage({ result, onContinue, onDayReview }: ChoiceResultPageProps) {
  const { data: gameState } = useQuery({ queryKey: QK.gameState, queryFn: getGameState });
  const { data: equippedItemsData } = useEquippedItems();

  const dayNumber = gameState?.current_day?.day_number;
  const dayFinished = allEventsResolved(gameState?.events);
  const { data: dailyResult } = useQuery({
    queryKey: dayNumber ? QK.dailyResult(dayNumber) : ["dailyResult", "pending"],
    queryFn: () => getDailyResult(dayNumber as number),
    enabled: dayFinished && dayNumber != null,
    retry: false,
  });

  if (!result) {
    return (
      <ErrorState
        title="Результат недоступен"
        message="Нет данных о результате."
        action={onContinue && <button type="button" onClick={onContinue}>Вернуться к игре</button>}
      />
    );
  }

  function deltaClass(d: number) {
    if (d > 0) return "cr__impact-value--pos";
    if (d < 0) return "cr__impact-value--neg";
    return "cr__impact-value--zero";
  }
  function deltaLabel(d: number) {
    return d > 0 ? `+${d}` : `${d}`;
  }
  function statDeltaClass(d: number) {
    if (d > 0) return "cr__arch-stat-delta--pos";
    if (d < 0) return "cr__arch-stat-delta--neg";
    return "cr__arch-stat-delta--zero";
  }

  const { event, result: choiceResult, participant } = result;
  const effects = choiceResult.effects;
  const isGoodResult = choiceResult.score_delta >= 0;
  const quality = isGoodResult ? "ХОРОШЕЕ РЕШЕНИЕ" : "РИСКОВАННОЕ РЕШЕНИЕ";
  const resultTone = isGoodResult ? "good" : "bad";
  const resultMood = isGoodResult ? "win" : "rekt";
  const archetypeId = (participant.archetype_slug ?? "risk_manager") as ArchetypeId;
  const equippedItems = equippedItemsData?.items ?? [];
  const assets = getArchetypeAssetsWithSkin(archetypeId, equippedItems);
  const archetypeAccent = archetypeAccentFor(archetypeId);
  const eventLabel = EVENT_TYPE_LABELS[event.event_type as EventType] ?? event.event_type;
  const scoreDeltaLabel = deltaLabel(choiceResult.score_delta);

  const impactEntries = Object.entries(effects) as Array<[keyof StatsDTO, number]>;

  const eveningBonus = findEvent(gameState?.events, "evening_bonus");
  const eveningBonusAvailable = event.event_type !== "evening_bonus" && eveningBonus?.status === "available";
  const handleShareChoice = async () => {
    try {
      const shareResult = await shareGameCard({
        kind: "choice_final",
        archetypeId,
        eventTitle: `${eventLabel} · День ${gameState?.current_day?.day_number ?? "?"}`,
        title: quality,
        resultText: choiceResult.result_text,
        choiceText: choiceResult.result_text,
        score: choiceResult.score_delta,
        effects,
        footer: "CRYPTO REALITY · ФИНАЛ ВЫБОРА",
        skinCutouts: getSkinCutoutOverrides(equippedItems, archetypeId),
      });
      if (shareResult === "downloaded") {
        notifyInfo("Карточка сохранена", "Файл скачан. Его можно отправить друзьям вручную.");
      } else {
        notifySuccess("Карточка готова", "Открылось системное меню шаринга.");
      }
    } catch {
      notifyError("Не удалось создать карточку", "Попробуй поделиться позже.");
    }
  };

  return (
    <main
      className={`cr cr--${resultTone}`}
      style={{ "--arch-accent": archetypeAccent, "--result-bg": `url("${assets.background}")` } as CSSProperties}
    >

      {/* ── Header ── */}
      <header className="cr__header">
        <div className="cr__brand-row">
          <BrandHeader />
        </div>
        <div className="cr__title-row">
          <div className="cr__title-line" />
          <h1 className="cr__page-title">CHOICE RESULT</h1>
          <div className="cr__title-line" />
        </div>
        <p className="cr__page-sub">— РЕЗУЛЬТАТ ВЫБОРА —</p>
      </header>

      <div className="cr__frame">

        {/* ── Context pills ── */}
        {gameState?.room && gameState.current_day && (
          <div className="cr__context-row">
            <span className="cr__context-pill">
              <span>КОМНАТА</span>
              <b>{gameState.room.title}</b>
            </span>
            <span className="cr__context-pill">
              <span>ДЕНЬ</span>
              <b>{gameState.current_day.day_number} / {gameState.room.season_length_days}</b>
            </span>
            <span className="cr__context-pill">
              <span>ОКНО</span>
              <b>{eventLabel}</b>
            </span>
          </div>
        )}

        {/* ── Result hero ── */}
        <section className={`cr__result-hero cr__result-hero--${resultTone}`}>
          <div className="cr__hero-bg" aria-hidden="true" />
          <div className="cr__hero-orbit" aria-hidden="true" />
          <img className="cr__result-img" src={assets.cutout[resultMood]} alt="" />

          <div className="cr__result-panel">
            <div className="cr__result-top">
              <span className={`cr__quality-badge cr__quality-badge--${resultTone}`}>{quality}</span>
              <span className={`cr__score-chip cr__score-chip--${resultTone}`}>{scoreDeltaLabel}</span>
            </div>
            <span className="cr__event-kicker">{eventLabel.toUpperCase()} · РЕЗУЛЬТАТ</span>
            <p className="cr__result-desc">{choiceResult.result_text}</p>
          </div>
        </section>

        {/* ── Impact ── */}
        {impactEntries.length > 0 && (
          <div className="cr__impact-card">
            <span className="cr__impact-title">ИТОГ ВЛИЯНИЯ</span>
            <div className="cr__impact-grid">
              {impactEntries.map(([key, delta]) => {
                const p = STAT_PRESENTATION[key];
                if (!p) return null;
                return (
                  <div key={key} className="cr__impact-item">
                    <div className="cr__impact-icon" style={{ color: p.color }}>
                      <p.Icon size={18} />
                    </div>
                    <span className="cr__impact-label">{p.label}</span>
                    <span className={`cr__impact-value ${deltaClass(delta)}`}>{deltaLabel(delta)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Archetype card ── */}
        <div className="cr__arch-card">
          <div className="cr__arch-body">
            <img className="cr__arch-avatar" src={assets.avatar.md} alt="" />
            <div className="cr__arch-info">
              <span className="cr__arch-name">Счёт сезона: {participant.score}</span>
            </div>
          </div>
          <div className="cr__arch-stats">
            {(Object.keys(STAT_PRESENTATION) as Array<keyof StatsDTO>).map((key) => {
              const p = STAT_PRESENTATION[key];
              const delta = effects[key] ?? 0;
              return (
                <div key={key} className="cr__arch-stat">
                  <div className="cr__arch-stat-icon" style={{ color: p.color }}>
                    <p.Icon size={14} />
                  </div>
                  <span className="cr__arch-stat-label">{p.label}</span>
                  <span className="cr__arch-stat-val" style={{ color: p.color }}>{participant.stats[key]}</span>
                  <span className={`cr__arch-stat-delta ${statDeltaClass(delta)}`}>{deltaLabel(delta)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA buttons ── */}
        <button type="button" className="cr__cta-next" onClick={onContinue}>
          {eveningBonusAvailable ? "→ ОТКРЫТЬ ВЕЧЕРНИЙ БОНУС" : "→ ВЕРНУТЬСЯ К ИГРЕ"}
        </button>
        {dailyResult && (
          <button type="button" className="cr__cta-review" onClick={onDayReview}>
            ИТОГИ ДНЯ
          </button>
        )}
        <button type="button" className="cr__cta-share" onClick={handleShareChoice}>
          ПОДЕЛИТЬСЯ ВЫБОРОМ
        </button>

      </div>
    </main>
  );
}

/* ── Icons ── */

function FlameIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2c0 0-7 5-7 12a7 7 0 0 0 14 0c0-4-3-7-3-7s0 3-2 4c0-3-2-9-2-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TargetIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function HeartIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v2m0 6v2m-1.5-8h2.5a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AlphaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 20l4-8 4 4 4-10 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SkullIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.83 1.18 5.38 3.08 7.17V19a1 1 0 0 0 1 1h9.84a1 1 0 0 0 1-1v-.83C19.82 17.38 21 14.83 21 12c0-4.97-4.03-9-9-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 17v1M12 17v1M15 17v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
