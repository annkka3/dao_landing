import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getGameState, submitChoice } from "../../api/endpoints";
import { createIdempotencyKey } from "../../api/idempotency";
import { QK } from "../../store/queryClient";
import { friendlyErrorMessage } from "../../api/errorMessages";
import { notifyError, notifySuccess } from "../../shared/notifications/notify";
import {
  EVENT_TYPE_LABELS,
  allEventsResolved,
  eventDisplayLabel,
  formatWindowTime,
  gameStateRefetchInterval,
  selectActiveEvent,
  selectNextUnresolvedEvent,
} from "../../features/game/gameState";
import type { EventType, SubmitChoiceResponse } from "../../api/types";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import "./CurrentEventPage.css";

// Purely positional (choice 1/2/3/4 → fixed icon/label), never tied to choice
// content or game-balance category — situations always carry exactly 4
// choices, so this can't leak which option is "the safe one". All four share
// the same accent color, matching the rest of the page's cyan theme.
const CHOICE_ACCENT_COLORS = [
  "var(--color-game-bonus)",
  "var(--color-game-bonus)",
  "var(--color-game-bonus)",
  "var(--color-game-bonus)",
];

const CHOICE_ICONS = [SearchIcon, EyeIcon, BoltIcon, MessageIcon];
const VARIANT_LABELS = ["ВАРИАНТ A", "ВАРИАНТ B", "ВАРИАНТ C", "ВАРИАНТ D"];

// Splits choice text at the first sentence boundary so the headline can be
// styled boldly and any remaining detail rendered smaller below it. Choices
// with no second sentence just render as a single styled line.
function splitChoiceText(text: string): { headline: string; detail: string | null } {
  const match = text.match(/^(.+?[.!?])\s+(.+)$/s);
  if (match) {
    return { headline: match[1], detail: match[2] };
  }
  return { headline: text, detail: null };
}

const EVENT_IMAGE_BASE = "/assets/share-cards/events";
const WAITING_BACKGROUND_SRC = "/assets/backgrounds/room_max_9x19.webp";

function eventImageSrc(situation: { event_type: string; slug: string; category: string }): string {
  const fileName = situation.event_type === "final" || situation.event_type === "rare"
    ? situation.slug
    : situation.category;
  return `${EVENT_IMAGE_BASE}/${fileName}.png`;
}

export interface CurrentEventPageProps {
  onResult?: (result: SubmitChoiceResponse) => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onBack?: () => void;
}

export function CurrentEventPage({ onResult, onProfile, onSettings }: CurrentEventPageProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QK.gameState,
    queryFn: getGameState,
    refetchInterval: (query) => gameStateRefetchInterval(query.state.data?.state),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const submitMutation = useMutation({
    mutationFn: ({ eventType, choiceId }: { eventType: EventType; choiceId: number }) =>
      submitChoice(
        { event_type: eventType, choice_id: choiceId },
        createIdempotencyKey("submit-choice")
      ),
    onSuccess: (result) => {
      const scoreDelta = result.result.score_delta;
      notifySuccess(
        "Выбор принят",
        scoreDelta !== 0 ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta} очков` : undefined
      );
      void queryClient.invalidateQueries({ queryKey: QK.gameState });
      void queryClient.invalidateQueries({ queryKey: QK.dailyResults });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      void queryClient.invalidateQueries({ queryKey: QK.finalResult });
      void queryClient.invalidateQueries({ queryKey: QK.achievements });
      onResult?.(result);
    },
    onError: (err) => {
      console.error(err);
      setSelectedChoiceId(null);
      notifyError("Не удалось сохранить выбор", friendlyErrorMessage(err));
    },
  });

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (isError) {
    return (
      <CeStatus
        icon={<AlertIcon size={26} />}
        tone="danger"
        title="Не удалось загрузить"
        message={friendlyErrorMessage(error)}
        actionLabel="Попробовать снова"
        onAction={() => refetch()}
      />
    );
  }

  if (!data || data.state !== "active" || !data.participant) {
    return (
      <CeStatus
        icon={<ClockIcon size={34} />}
        variant="clock"
        title="Нет активной игры"
        message="Сейчас нет активной игры."
      />
    );
  }

  const { participant, events, current_day: currentDay, room } = data;
  const activeEvent = selectActiveEvent(events);

  if (!activeEvent || !activeEvent.situation) {
    const allDone = allEventsResolved(events);
    const next = selectNextUnresolvedEvent(events);
    const nextMorningTarget = allDone ? nextMorningWindowStart(currentDay, room) : undefined;
    const countdownTarget = allDone ? nextMorningTarget : next ? next.window_start : undefined;
    const message = allDone
      ? "На сегодня все события пройдены."
      : next
        ? next.event_type === "evening_bonus"
          ? "Вечерний бонус откроется после того, как ты пройдёшь утро и день."
          : `Событие «${EVENT_TYPE_LABELS[next.event_type]}» откроется в ${formatWindowTime(next.window_start)}.`
        : "Сейчас нет доступных событий.";
    return (
      <CeStatus
        icon={allDone ? <CheckCircleIcon size={34} /> : <HourglassIcon size={30} />}
        variant={allDone ? "complete" : "waiting"}
        title={allDone ? "На сегодня всё пройдено" : "Событие пока недоступно"}
        message={message}
        countdownValue={countdownTarget ? formatCountdownUntil(countdownTarget, nowMs) : undefined}
        countdownLabel={countdownTarget ? (allDone ? "До утреннего события" : "До события") : undefined}
      />
    );
  }

  const { situation } = activeEvent;
  const eventImage = eventImageSrc(situation);
  const eventLabel = eventDisplayLabel(activeEvent);
  const participantArchetypeId = (participant.archetype_slug ?? "risk_manager") as ArchetypeId;

  return (
    <main className="ce">

      {/* ── Header ── */}
      <header className="ce__header">
        <div className="ce__brand-row">
          <BrandHeader />
          <button className="ce__gear-btn" type="button" aria-label="Настройки" onClick={onSettings}>
            <GearIcon size={20} />
          </button>
        </div>
        <div className="ce__title-row">
          <div className="ce__title-line" />
          <h1 className="ce__page-title">CURRENT EVENT</h1>
          <div className="ce__title-line" />
        </div>
        <p className="ce__page-sub">— ТЕКУЩЕЕ СОБЫТИЕ —</p>
      </header>

      <div className="ce__frame">

        {/* ── Section: current event ── */}
        <div className="ce__section-label">
          <div className="ce__section-line" />
          <span className="ce__section-arrow">→</span>
          <span className="ce__section-text">{eventLabel.toUpperCase()}</span>
          <span className="ce__section-arrow">←</span>
          <div className="ce__section-line" />
        </div>

        {/* ── Event card ── */}
        <div className="ce__evt-card">
          <div className="ce__evt-layout">
            <div className="ce__evt-img-wrap">
              <img
                className="ce__evt-img"
                src={eventImage}
                alt=""
                onError={(event) => {
                  event.currentTarget.closest(".ce__evt-img-wrap")?.classList.add("ce__evt-img-wrap--missing");
                }}
              />
            </div>
            <div className="ce__evt-info">
              <span className="ce__evt-type-badge">{eventLabel}</span>
              <h2 className="ce__evt-title">{situation.title}</h2>
              <p className="ce__evt-desc">{situation.text}</p>
            </div>
          </div>
          <div className="ce__evt-footer">
            <div className="ce__evt-timer">
              <span className="ce__evt-timer-label"><HourglassIcon size={11} /> ДО КОНЦА ОКНА</span>
              <span className="ce__evt-timer-val">{formatWindowTime(activeEvent.window_end)}</span>
            </div>
          </div>
        </div>

        {/* ── Section: choose action ── */}
        <div className="ce__section-label">
          <div className="ce__section-line" />
          <span className="ce__section-arrow">→</span>
          <span className="ce__section-text">ВЫБЕРИ ДЕЙСТВИЕ</span>
          <span className="ce__section-arrow">←</span>
          <div className="ce__section-line" />
        </div>
        <p className="ce__choices-subtitle">Выбирай по логике. Последствия вскроются потом.</p>

        {submitMutation.isError && (
          <p className="ce__evt-desc">{friendlyErrorMessage(submitMutation.error)}</p>
        )}

        {/* ── Choices ── */}
        <div className="ce__actions-grid">
          {situation.choices.map((choice, index) => {
            const Icon = CHOICE_ICONS[index % CHOICE_ICONS.length];
            const { headline, detail } = splitChoiceText(choice.text);
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                className={`ce__action-card${isSelected ? " ce__action-card--selected" : ""}`}
                style={{ "--ac": CHOICE_ACCENT_COLORS[index % CHOICE_ACCENT_COLORS.length] } as CSSProperties}
                disabled={submitMutation.isPending}
                onClick={() => {
                  setSelectedChoiceId(choice.id);
                  submitMutation.mutate({ eventType: activeEvent.event_type, choiceId: choice.id });
                }}
              >
                <span className="ce__action-variant-badge">
                  {isSelected ? "✓ ВЫБРАНО" : VARIANT_LABELS[index % VARIANT_LABELS.length]}
                </span>
                <div className="ce__action-row">
                  <div className="ce__action-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div className="ce__action-text">
                    <span className="ce__action-title">{headline}</span>
                    {detail && <span className="ce__action-desc">{detail}</span>}
                  </div>
                  <ChevronRightIcon size={14} />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Player archetype card ── */}
        <div
          className="ce__arch-card"
          style={{ "--arch-accent": "var(--color-game-bonus)" } as CSSProperties}
        >
          <div className="ce__arch-toprow">
            <span className="ce__arch-label-tag">АРХЕТИП</span>
            <div className="ce__arch-actions">
              <button className="ce__arch-profile-btn" type="button" onClick={onProfile}>
                ПРОФИЛЬ <ChevronRightIcon size={12} />
              </button>
            </div>
          </div>
          <div className="ce__arch-body">
            <img
              className="ce__arch-avatar"
              src={archetypeAssets[participantArchetypeId].avatar.md}
              alt=""
            />
            <div className="ce__arch-info">
              <div className="ce__arch-stats">
                <div className="ce__arch-stat">
                  <span className="ce__arch-stat-label">FOMO</span>
                  <span className="ce__arch-stat-val">{participant.stats.fomo}</span>
                </div>
                <div className="ce__arch-stat">
                  <span className="ce__arch-stat-label">РЕПУТ</span>
                  <span className="ce__arch-stat-val">{participant.stats.reputation}</span>
                </div>
                <div className="ce__arch-stat">
                  <span className="ce__arch-stat-label">ДИСЦ</span>
                  <span className="ce__arch-stat-val">{participant.stats.discipline}</span>
                </div>
                <div className="ce__arch-stat">
                  <span className="ce__arch-stat-label">СТРЕСС</span>
                  <span className="ce__arch-stat-val">{participant.stats.stress}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

function nextMorningWindowStart(
  currentDay: { day_number: number; morning_start: string; evening_end: string } | null | undefined,
  room: { season_length_days: number } | null | undefined
): string | undefined {
  if (!currentDay || !room || currentDay.day_number >= room.season_length_days) return undefined;

  const morningStartMs = new Date(currentDay.morning_start).getTime();
  const eveningEndMs = new Date(currentDay.evening_end).getTime();
  if (Number.isNaN(morningStartMs) || Number.isNaN(eveningEndMs)) return undefined;

  const currentDayDurationMs = eveningEndMs - morningStartMs;
  const isPackedTestSchedule = currentDayDurationMs > 0 && currentDayDurationMs < 2 * 60 * 60 * 1_000;
  if (isPackedTestSchedule) {
    return currentDay.evening_end;
  }

  return new Date(morningStartMs + 24 * 60 * 60 * 1_000).toISOString();
}

/* ── Status screen (no event / locked / error) — styled to match the page ── */

function CeStatus({
  icon,
  tone = "info",
  variant = "default",
  title,
  message,
  countdownLabel,
  countdownValue,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  tone?: "info" | "danger";
  variant?: "default" | "waiting" | "complete" | "clock";
  title: string;
  message: string;
  countdownLabel?: string;
  countdownValue?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const isSceneStatus = variant === "waiting" || variant === "complete" || variant === "clock";
  return (
    <main className={`ce${isSceneStatus ? " ce--waiting" : ""}`}>

      {/* ── Header ── */}
      <header className="ce__header">
        <div className="ce__brand-row">
          <BrandHeader />
        </div>
        <div className="ce__title-row">
          <div className="ce__title-line" />
          <h1 className="ce__page-title">CURRENT EVENT</h1>
          <div className="ce__title-line" />
        </div>
        <p className="ce__page-sub">— ТЕКУЩЕЕ СОБЫТИЕ —</p>
      </header>

      <div className="ce__frame">

        <div
          className={`ce__locked-card${tone === "danger" ? " ce__locked-card--danger" : ""}${isSceneStatus ? " ce__locked-card--waiting" : ""}${variant === "complete" ? " ce__locked-card--complete" : ""}${variant === "clock" ? " ce__locked-card--clock" : ""}`}
          style={isSceneStatus ? { "--waiting-bg": `url("${WAITING_BACKGROUND_SRC}")` } as CSSProperties : undefined}
        >
          {isSceneStatus && <div className="ce__waiting-bg" aria-hidden="true" />}
          <div className="ce__locked-icon">{icon}</div>
          <h2 className="ce__locked-title">{title}</h2>
          <p className="ce__locked-desc">{message}</p>
          {countdownValue && (
            <div className="ce__waiting-countdown" aria-label={countdownLabel}>
              <span className="ce__waiting-countdown-label">{countdownLabel}</span>
              <span className="ce__waiting-countdown-value">{countdownValue}</span>
            </div>
          )}
          {actionLabel && onAction && (
            <button className="ce__locked-btn" type="button" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>

      </div>
    </main>
  );
}

function formatCountdownUntil(iso: string, nowMs: number): string {
  const targetMs = new Date(iso).getTime();
  if (Number.isNaN(targetMs)) return "СКОРО";

  const remainingSeconds = Math.max(0, Math.ceil((targetMs - nowMs) / 1_000));
  if (remainingSeconds <= 0) return "СКОРО";

  const hours = Math.floor(remainingSeconds / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
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

function CheckCircleIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="ce__check-ring" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path className="ce__check-mark" d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path className="ce__clock-hand ce__clock-hand--hour" d="M12 12V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path className="ce__clock-hand ce__clock-hand--minute" d="M12 12H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3.5V2M12 22v-1.5M20.5 12H22M2 12h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.58" />
    </svg>
  );
}

function AlertIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HourglassIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 3h14M5 21h14M7 3v4l4 4.5L7 16v5M17 3v4l-4 4.5L17 16v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BoltIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function MessageIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
