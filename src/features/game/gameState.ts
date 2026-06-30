import type {
  EventStatus,
  EventType,
  GameEventDTO,
  GameRoomDayDTO,
  GameState,
  StatsDTO,
} from "../../api/types";

export const STAT_LABELS: Record<keyof StatsDTO, string> = {
  bankroll: "Банкролл",
  discipline: "Дисциплина",
  fomo: "FOMO",
  reputation: "Репутация",
  alpha: "Альфа",
  stress: "Стресс",
  degen_index: "Degen Index",
};

export const EVENT_ORDER: EventType[] = ["morning", "day", "evening_bonus"];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  morning: "Утро",
  day: "День",
  evening_bonus: "Вечерний бонус",
  rare: "Редкое событие",
  final: "Финал",
};

const RESOLVED_STATUSES: EventStatus[] = ["completed", "missed"];

export function isResolved(status: EventStatus): boolean {
  return RESOLVED_STATUSES.includes(status);
}

export function findEvent(
  events: GameEventDTO[] | undefined,
  type: EventType
): GameEventDTO | undefined {
  return events?.find((e) => e.event_type === type);
}

export function eventDisplayType(event: GameEventDTO): string {
  const situationType = event.situation?.event_type;
  return situationType === "rare" || situationType === "final"
    ? situationType
    : event.event_type;
}

export function eventDisplayLabel(event: GameEventDTO): string {
  const type = eventDisplayType(event);
  return EVENT_TYPE_LABELS[type] ?? type;
}

/** First event with status "available", in morning -> day -> evening_bonus order. */
export function selectActiveEvent(events: GameEventDTO[] | undefined): GameEventDTO | undefined {
  if (!events) return undefined;
  for (const type of EVENT_ORDER) {
    const event = events.find((e) => e.event_type === type && e.status === "available");
    if (event) return event;
  }
  return undefined;
}

/** First event that is neither completed nor missed, used to explain what's still locked. */
export function selectNextUnresolvedEvent(events: GameEventDTO[] | undefined): GameEventDTO | undefined {
  if (!events) return undefined;
  for (const type of EVENT_ORDER) {
    const event = events.find((e) => e.event_type === type);
    if (event && !isResolved(event.status)) return event;
  }
  return undefined;
}

export function allEventsResolved(events: GameEventDTO[] | undefined): boolean {
  if (!events || events.length === 0) return false;
  return events.every((e) => isResolved(e.status));
}

/** Polling cadence for GET /game/state, per game state. */
export function gameStateRefetchInterval(state: GameState | undefined): number | false {
  if (state === "active") return 20_000;
  if (state === "lobby") return 12_000;
  return false;
}

export function formatWindowTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function currentDayWindowFor(currentDay: GameRoomDayDTO, type: EventType): [string, string] {
  if (type === "morning") return [currentDay.morning_start, currentDay.morning_end];
  if (type === "day") return [currentDay.day_start, currentDay.day_end];
  return [currentDay.evening_start, currentDay.evening_end];
}

/** Window of the first unresolved event that hasn't opened yet (or is open but has no active status for some reason). */
export function selectNextWaitingWindow(
  events: GameEventDTO[] | undefined,
  currentDay: GameRoomDayDTO,
  nowMs: number
): { windowStart: string; windowEnd: string } | undefined {
  for (const type of EVENT_ORDER) {
    const event = events?.find((item) => item.event_type === type);
    if (event?.status === "completed" || event?.status === "missed") continue;

    const [windowStart, windowEnd] = currentDayWindowFor(currentDay, type);
    const windowStartMs = new Date(windowStart).getTime();
    const windowEndMs = new Date(windowEnd).getTime();

    if (!Number.isNaN(windowStartMs) && windowStartMs > nowMs) {
      return { windowStart, windowEnd };
    }

    if (Number.isNaN(windowEndMs) || windowEndMs > nowMs) {
      return { windowStart, windowEnd };
    }
  }

  return undefined;
}

export function formatDurationUntil(iso: string, nowMs: number): string {
  const targetMs = new Date(iso).getTime();
  if (Number.isNaN(targetMs)) return "скоро";

  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) return "скоро";

  const totalMinutes = Math.max(1, Math.ceil(diffMs / 60_000));
  if (totalMinutes < 60) return `${totalMinutes} мин`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`;
}
