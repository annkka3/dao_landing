import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { archetypeAccentFor } from "../../shared/assets/archetypePresentation";
import { HoloAtomCore } from "../../shared/ui/HoloAtomCore/HoloAtomCore";
import { getGameState, getLeaderboard } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { EquippedProfileFrame } from "../../features/market/components/EquippedProfileFrame";
import { getEquippedProfileFrame } from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import {
  eventDisplayLabel,
  formatDurationUntil,
  formatWindowTime,
  selectActiveEvent,
  selectNextWaitingWindow,
} from "../../features/game/gameState";
import type {
  ArchetypesListResponse,
  LeaderboardEntryDTO,
  ParticipantDTO,
  RoomDTO,
  RoomEventFeedItemDTO,
  RoomParticipantSummaryDTO,
} from "../../api/types";
import { eventFeedActionLabel, eventFeedWindowLabel, formatScoreDelta } from "./LobbyPage";

export interface ActiveRoomScreenProps {
  room: RoomDTO;
  participant: ParticipantDTO | null;
  participants: RoomParticipantSummaryDTO[];
  archetypesData: ArchetypesListResponse | undefined;
  eventFeedItems: RoomEventFeedItemDTO[];
  visibleEventFeedItems: RoomEventFeedItemDTO[];
  canToggleEventFeed: boolean;
  eventFeedExpanded: boolean;
  onToggleEventFeed: () => void;
  onOpenEvent?: () => void;
  onFinal?: () => void;
  onInvite?: () => void;
  onLeave: () => void;
  leavePending: boolean;
  seasonFinished?: boolean;
}

const HUB_RADIUS_PERCENT = 36;
const HUB_COMPACT_RADIUS_PERCENT = 42;
const HUB_DENSE_OUTER_RADIUS_PERCENT = 42;
const HUB_DENSE_INNER_RADIUS_PERCENT = 25;
const HUB_COMPACT_THRESHOLD = 7;
const HUB_DENSE_THRESHOLD = 11;
const ROOM_LEADERBOARD_PREVIEW_LIMIT = 5;
const ROOM_LEADERBOARD_FETCH_LIMIT = 100;

const ROOM_ARCH_INFO: Record<ArchetypeId, { name: string; accent: string }> = {
  risk_manager: { name: "Risk Manager", accent: "#3a8cff" },
  meme_degen: { name: "Meme Degen", accent: "#b84dff" },
  onchain_detective: { name: "On-chain Detective", accent: "#00d4ff" },
  leverage_cowboy: { name: "Leverage Cowboy", accent: "#ffba00" },
  hodl_monk: { name: "HODL Monk", accent: "#ffd23f" },
  airdrop_farmer: { name: "Airdrop Farmer", accent: "#22e6b3" },
  moon_prophet: { name: "Moon Prophet", accent: "#39ff14" },
  capitulation_doomer: { name: "Capitulation Doomer", accent: "#ff3b30" },
};

const ROOM_DEFAULT_ARCH = { name: "—", accent: "var(--color-text-muted)" };

// Scattered light flicker positions over the background photo — approximate,
// not registered to specific windows in the image (it's a photo, not a
// procedural skyline), but reads convincingly as ambient city light.
const BG_WINDOWS: Array<{ left: number; top: number; duration: number; delay: number; tone: string }> = [
  { left: 8, top: 28, duration: 2.1, delay: 0, tone: "#F5C875" },
  { left: 14, top: 42, duration: 2.9, delay: 0.6, tone: "#00e5ff" },
  { left: 22, top: 20, duration: 3.4, delay: 1.2, tone: "#F5C875" },
  { left: 30, top: 50, duration: 1.8, delay: 0.3, tone: "#F5C875" },
  { left: 38, top: 16, duration: 2.4, delay: 1.8, tone: "#00e5ff" },
  { left: 47, top: 35, duration: 3.1, delay: 0.9, tone: "#F5C875" },
  { left: 55, top: 22, duration: 2.6, delay: 2.1, tone: "#00e5ff" },
  { left: 63, top: 46, duration: 1.9, delay: 0.4, tone: "#F5C875" },
  { left: 71, top: 18, duration: 3.3, delay: 1.5, tone: "#F5C875" },
  { left: 79, top: 38, duration: 2.2, delay: 2.4, tone: "#00e5ff" },
  { left: 87, top: 24, duration: 2.8, delay: 0.7, tone: "#F5C875" },
  { left: 92, top: 44, duration: 3.0, delay: 1.1, tone: "#00e5ff" },
];

export function ActiveRoomScreen({
  room,
  participant,
  participants,
  archetypesData,
  eventFeedItems,
  visibleEventFeedItems,
  canToggleEventFeed,
  eventFeedExpanded,
  onToggleEventFeed,
  onOpenEvent,
  onFinal,
  onInvite,
  onLeave,
  leavePending,
  seasonFinished = false,
}: ActiveRoomScreenProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false);

  const { data: gameState } = useQuery({
    queryKey: QK.gameState,
    queryFn: getGameState,
    refetchInterval: 20_000,
  });

  const { data: leaderboardData } = useQuery({
    queryKey: [...QK.leaderboard(room.public_id), "active-room", ROOM_LEADERBOARD_FETCH_LIMIT],
    queryFn: () => getLeaderboard(room.public_id, ROOM_LEADERBOARD_FETCH_LIMIT),
    refetchInterval: room.status === "active" ? 20_000 : false,
  });
  const { data: equippedItemsData } = useEquippedItems(participant != null);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDay = gameState?.current_day ?? undefined;
  const events = gameState?.events ?? [];
  const activeEvent = selectActiveEvent(events);
  const waitingWindow = !activeEvent && currentDay ? selectNextWaitingWindow(events, currentDay, nowMs) : undefined;

  const eventName = seasonFinished ? "Сезон завершён" : activeEvent ? eventDisplayLabel(activeEvent) : waitingWindow ? "Следующее окно" : "Событий пока нет";
  const timerLabel = seasonFinished ? "ФИНАЛ" : activeEvent ? "ДО КОНЦА ОКНА" : "НАЧНЁТСЯ ЧЕРЕЗ";
  const timerValue = seasonFinished
    ? "готов"
    : activeEvent
    ? formatWindowTime(activeEvent.window_end)
    : waitingWindow
      ? formatDurationUntil(waitingWindow.windowStart, nowMs)
      : "—";
  const leaderboardEntries = leaderboardData?.entries ?? [];
  const topThree = leaderboardEntries.slice(0, 3);
  const visibleLeaderboardEntries = leaderboardExpanded
    ? leaderboardEntries
    : leaderboardEntries.slice(0, ROOM_LEADERBOARD_PREVIEW_LIMIT);
  const currentUserEntry =
    leaderboardData?.current_user_entry ??
    leaderboardEntries.find((entry) => entry.is_current_user || entry.participant_id === participant?.id) ??
    null;
  const currentUserInVisible =
    currentUserEntry != null &&
    visibleLeaderboardEntries.some((entry) => entry.participant_id === currentUserEntry.participant_id);
  const currentUserFrame = getEquippedProfileFrame(equippedItemsData?.items ?? []);
  const showCurrentUserBelow = !leaderboardExpanded && currentUserEntry != null && !currentUserInVisible;
  const canToggleLeaderboard = leaderboardEntries.length > ROOM_LEADERBOARD_PREVIEW_LIMIT;
  const seasonStatusLabel = seasonFinished || gameState?.state === "finished" ? "СЕЗОН ЗАВЕРШЁН" : "СЕЗОН ИДЁТ";

  return (
    <>
      <div className="arm__bg-zone">
        <div className="arm__bg-image" />
        {BG_WINDOWS.map((w, i) => (
          <div
            key={i}
            className="arm__bg-window"
            style={{ left: `${w.left}%`, top: `${w.top}%`, animationDuration: `${w.duration}s`, animationDelay: `${w.delay}s`, background: w.tone }}
          />
        ))}
        <div className="arm__bg-scan" />
        <div className="arm__bg-fade" />

        {currentDay && (
          <div className="arm__day-card">
            <span className="arm__day-title">
              ДЕНЬ {currentDay.day_number} ИЗ {room.season_length_days}
            </span>
            <div className="arm__day-track">{buildDayPips(currentDay.day_number, room.season_length_days)}</div>
          </div>
        )}

        <div className="arm__event-banner">
          <div>
            <span className="arm__event-banner-label">
              {seasonFinished ? "ИТОГИ СЕЗОНА" : activeEvent ? "ТЕКУЩЕЕ СОБЫТИЕ" : "СЛЕДУЮЩЕЕ СОБЫТИЕ"}
            </span>
            <span className="arm__event-banner-name">{eventName}</span>
          </div>
          <div className="arm__event-banner-timer">
            <span className="arm__event-banner-label">{timerLabel}</span>
            <span className="arm__event-banner-val">{timerValue}</span>
          </div>
        </div>

        <div className={hubClassName(participants.length)}>
          <div className="arm__hub-core">
            <HoloAtomCore size={180} />
          </div>
          {participants.map((p, index) => {
            const layout = participantHubLayout(participants.length, index);
            const pArchetypeId = (p.archetype_slug ?? undefined) as ArchetypeId | undefined;
            const pAccent = archetypeAccentFor(p.archetype_slug);
            const pArchetypeName = archetypesData?.items.find((a) => a.slug === p.archetype_slug)?.name;
            const isMe = participant != null && p.participant_id === participant.id;
            const avatarNode = (
              <div className="arm__hub-avatar">
                {pArchetypeId ? (
                  <img src={archetypeAssets[pArchetypeId].avatar.sm} alt="" />
                ) : (
                  <span className="arm__hub-avatar-empty">?</span>
                )}
                {p.is_creator && (
                  <span className="arm__hub-crown" aria-label="Создатель комнаты">
                    <CrownIcon size={11} />
                  </span>
                )}
              </div>
            );
            return (
              <div
                key={p.participant_id}
                className={`arm__hub-slot arm__hub-slot--${layout.ring}`}
                title={`${isMe ? "Ты" : p.display_name}${pArchetypeName ? ` · ${pArchetypeName}` : ""}`}
                style={{ left: `${layout.left}%`, top: `${layout.top}%`, "--hub-accent": pAccent } as CSSProperties}
              >
                {isMe ? (
                  <EquippedProfileFrame frame={currentUserFrame} size="sm" className="arm__hub-equipped-frame">
                    {avatarNode}
                  </EquippedProfileFrame>
                ) : (
                  avatarNode
                )}
                <span className="arm__hub-name">{isMe ? "Ты" : p.display_name}</span>
                {pArchetypeName && <span className="arm__hub-archetype">{pArchetypeName}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <section className="arm__leaderboard" aria-label="Таблица лидеров комнаты">
        <div className="arm__leaderboard-title-row">
          <div className="arm__leaderboard-title-line" />
          <h3 className="arm__leaderboard-title">LEADERBOARD</h3>
          <div className="arm__leaderboard-title-line" />
        </div>
        <p className="arm__leaderboard-sub">— ТАБЛИЦА ЛИДЕРОВ —</p>
        <div className="arm__leaderboard-season">
          <span>✓</span>
          <span>{seasonStatusLabel}</span>
          <span>✓</span>
        </div>

        <div className="arm__leaderboard-podium" aria-label="Топ 3 игроков">
          {leaderboardEntries.length === 0 ? (
            <div className="arm__leaderboard-empty">Таблица появится после первых решений игроков.</div>
          ) : (
            [topThree[1], topThree[0], topThree[2]].map((entry, index) => (
              <RoomPodiumCard
                key={entry?.participant_id ?? `room-podium-empty-${index}`}
                entry={entry}
                slot={index === 0 ? "second" : index === 1 ? "first" : "third"}
              />
            ))
          )}
        </div>

        {leaderboardEntries.length > 0 && (
          <div className="arm__leaderboard-list-card">
            <div className="arm__leaderboard-list-title-row">
              <div className="arm__leaderboard-title-line" />
              <h4 className="arm__leaderboard-list-title">ТОП ИГРОКОВ КОМНАТЫ</h4>
              <div className="arm__leaderboard-title-line" />
            </div>
            <div className="arm__leaderboard-list">
              {visibleLeaderboardEntries.map((entry) => (
                <RoomLeaderListRow
                  key={entry.participant_id}
                  entry={entry}
                  currentParticipantId={participant?.id}
                  currentUserFrame={currentUserFrame}
                />
              ))}
            </div>

            {showCurrentUserBelow && currentUserEntry && (
              <>
                <div className="arm__leaderboard-gap" aria-hidden="true">
                  ...
                </div>
                <RoomLeaderListRow
                  entry={currentUserEntry}
                  currentParticipantId={participant?.id}
                  currentUserFrame={currentUserFrame}
                />
              </>
            )}

            {canToggleLeaderboard && (
              <button className="arm__leaderboard-toggle" type="button" onClick={() => setLeaderboardExpanded((expanded) => !expanded)}>
                {leaderboardExpanded ? "Свернуть" : "Посмотреть всех"}
              </button>
            )}
          </div>
        )}
      </section>

      <section className="arm__feed">
        <h3 className="arm__feed-title">
          <ActivityIcon size={15} /> Лента событий
        </h3>
        {eventFeedItems.length > 0 ? (
          <>
            <div className="arm__feed-list">
              {visibleEventFeedItems.map((item) => (
                <ActiveRoomFeedRow key={item.id} item={item} />
              ))}
            </div>
            {canToggleEventFeed && (
              <button className="arm__feed-toggle" type="button" onClick={onToggleEventFeed}>
                {eventFeedExpanded ? "Свернуть" : "Посмотреть все"}
              </button>
            )}
          </>
        ) : (
          <div className="arm__feed-empty">Первые события комнаты появятся здесь после выборов игроков.</div>
        )}
      </section>

      <div className="arm__actions">
        <button
          className={`arm__goto-btn ${activeEvent || seasonFinished ? "arm__goto-btn--pulse" : "arm__goto-btn--dim"}`}
          type="button"
          onClick={seasonFinished ? onFinal : onOpenEvent}
          disabled={!activeEvent && !seasonFinished}
        >
          {seasonFinished ? <ChartIcon size={17} /> : <PlayIcon size={17} />}
          <span>{seasonFinished ? "Посмотреть финал" : activeEvent ? "Перейти к игре" : "Сейчас нет доступных событий"}</span>
        </button>
        {!seasonFinished && (
          <button className="lobby__action-btn lobby__action-btn--invite" type="button" onClick={onInvite}>
            <SendIcon size={17} />
            Пригласить друзей
          </button>
        )}
        <button
          className="lobby__action-btn lobby__action-btn--leave"
          type="button"
          disabled={leavePending}
          onClick={onLeave}
        >
          <ExitDoorIcon size={17} />
          {leavePending ? "Выходим..." : "Покинуть комнату"}
        </button>
      </div>
    </>
  );
}

function hubClassName(count: number): string {
  return [
    "arm__hub",
    count >= HUB_COMPACT_THRESHOLD && count < HUB_DENSE_THRESHOLD && "arm__hub--compact",
    count >= HUB_DENSE_THRESHOLD && "arm__hub--dense",
  ]
    .filter(Boolean)
    .join(" ");
}

function participantHubLayout(
  count: number,
  index: number
): { left: number; top: number; ring: "single" | "outer" | "inner" } {
  if (count <= 0) {
    return { left: 50, top: 50, ring: "single" };
  }

  if (count < HUB_DENSE_THRESHOLD) {
    const radius = count >= HUB_COMPACT_THRESHOLD ? HUB_COMPACT_RADIUS_PERCENT : HUB_RADIUS_PERCENT;
    const angleDeg = -90 + (360 / count) * index;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      left: 50 + radius * Math.cos(angleRad),
      top: 50 + radius * Math.sin(angleRad),
      ring: "single",
    };
  }

  const outerCount = Math.min(12, Math.ceil(count * 0.6));
  const isOuter = index < outerCount;
  const ringCount = isOuter ? outerCount : count - outerCount;
  const ringIndex = isOuter ? index : index - outerCount;
  const radius = isOuter ? HUB_DENSE_OUTER_RADIUS_PERCENT : HUB_DENSE_INNER_RADIUS_PERCENT;
  const offset = isOuter ? -90 : -90 + 180 / Math.max(1, ringCount);
  const angleDeg = offset + (360 / Math.max(1, ringCount)) * ringIndex;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    left: 50 + radius * Math.cos(angleRad),
    top: 50 + radius * Math.sin(angleRad),
    ring: isOuter ? "outer" : "inner",
  };
}

function buildDayPips(currentDay: number, totalDays: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const done = d < currentDay;
    const active = d === currentDay;
    if (d > 1) {
      nodes.push(<div key={`c${d}`} className={`arm__day-conn${d <= currentDay ? " arm__day-conn--done" : ""}`} />);
    }
    nodes.push(
      <div
        key={`n${d}`}
        className={["arm__day-pip", done && "arm__day-pip--done", active && "arm__day-pip--active"]
          .filter(Boolean)
          .join(" ")}
      >
        {done ? <CheckSmIcon size={10} /> : <span>{d}</span>}
      </div>
    );
  }
  return nodes;
}

function ActiveRoomFeedRow({ item }: { item: RoomEventFeedItemDTO }) {
  const isPositive = item.score_delta >= 0;
  const Icon = item.event_type === "evening_bonus" ? MoonIcon : item.status === "missed" ? AlertIcon : BoltIcon;
  const iconTone = item.status === "missed" ? "var(--color-state-danger)" : "var(--color-game-bonus)";
  return (
    <div className="arm__feed-row">
      <div className="arm__feed-row-icon" style={{ "--feed-icon-tone": iconTone } as CSSProperties}>
        <Icon size={12} />
      </div>
      <div className="arm__feed-row-body">
        <div className="arm__feed-row-main">
          <span className="arm__feed-row-name">{item.display_name}</span>
          <span className="arm__feed-row-action">{eventFeedActionLabel(item)}</span>
        </div>
        <span className="arm__feed-row-meta">{eventFeedWindowLabel(item)}</span>
      </div>
      <span className={`arm__feed-row-score ${isPositive ? "arm__feed-row-score--pos" : "arm__feed-row-score--neg"}`}>
        {formatScoreDelta(item.score_delta)}
      </span>
    </div>
  );
}

function RoomPodiumCard({
  entry,
  slot,
}: {
  entry: LeaderboardEntryDTO | undefined;
  slot: "first" | "second" | "third";
}) {
  if (!entry) {
    return <div className={`arm__podium-card arm__podium-card--${slot} arm__podium-card--empty`} />;
  }

  const arch = roomArchetypeInfo(entry.archetype_slug);
  const assets = roomArchetypeAssetsFor(entry.archetype_slug);
  const podiumHeroSrc = entry.character_skin?.cutouts.neutral ?? assets?.cutout.neutral;

  return (
    <div className={`arm__podium-card arm__podium-card--${slot}`} style={{ "--arch-accent": arch.accent } as CSSProperties}>
      <span className={`arm__podium-rank arm__podium-rank--${entry.rank}`}>{entry.rank}</span>
      {podiumHeroSrc ? (
        <img className="arm__podium-hero" src={podiumHeroSrc} alt="" />
      ) : (
        <span className="arm__podium-hero arm__podium-hero--empty" />
      )}
      <div className="arm__podium-info">
        <span className="arm__podium-name">{entry.display_name}</span>
        <span className="arm__podium-arch" style={{ color: arch.accent }}>
          {arch.name}
        </span>
        <span className="arm__podium-score">{formatLeaderboardScore(entry.score)}</span>
      </div>
    </div>
  );
}

function RoomLeaderListRow({
  entry,
  currentParticipantId,
  currentUserFrame,
}: {
  entry: LeaderboardEntryDTO;
  currentParticipantId?: number;
  currentUserFrame: ReturnType<typeof getEquippedProfileFrame>;
}) {
  const arch = roomArchetypeInfo(entry.archetype_slug);
  const assets = roomArchetypeAssetsFor(entry.archetype_slug);
  const isCurrentUser = entry.is_current_user || entry.participant_id === currentParticipantId;
  const avatarNode = (
    <div className="arm__leaderboard-avatar-wrap" style={{ "--arch-accent": arch.accent } as CSSProperties}>
      {assets ? (
        <img className="arm__leaderboard-avatar" src={assets.avatar.sm} alt="" />
      ) : (
        <span className="arm__leaderboard-avatar arm__leaderboard-avatar--empty" />
      )}
    </div>
  );

  return (
    <div className={`arm__leaderboard-row${isCurrentUser ? " arm__leaderboard-row--me" : ""}`}>
      <span className={`arm__leaderboard-rank arm__leaderboard-rank--${entry.rank <= 3 ? entry.rank : "default"}`}>
        {entry.rank}
      </span>

      {isCurrentUser ? (
        <EquippedProfileFrame frame={currentUserFrame} size="sm" className="arm__leaderboard-equipped-frame">
          {avatarNode}
        </EquippedProfileFrame>
      ) : (
        avatarNode
      )}

      <div className="arm__leaderboard-info">
        <span className="arm__leaderboard-name">{entry.display_name}</span>
        <span className="arm__leaderboard-arch" style={{ color: arch.accent }}>
          {arch.name}
        </span>
      </div>

      <div className="arm__leaderboard-score-wrap">
        <span className="arm__leaderboard-score">{formatLeaderboardScore(entry.score)}</span>
        {entry.rank === 1 && <span className="arm__leaderboard-leader">ЛИДЕР</span>}
      </div>
    </div>
  );
}

function roomArchetypeInfo(slug: string | null) {
  return slug ? (ROOM_ARCH_INFO[slug as ArchetypeId] ?? ROOM_DEFAULT_ARCH) : ROOM_DEFAULT_ARCH;
}

function roomArchetypeAssetsFor(slug: string | null) {
  if (!slug || !(slug in archetypeAssets)) return null;
  return archetypeAssets[slug as ArchetypeId];
}

function formatLeaderboardScore(score: number): string {
  return score.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

/* ── Icons ── */

function CrownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 19h18l-1.5-9-4.5 3.5L12 6l-3 7.5L4.5 10 3 19z" />
    </svg>
  );
}

function ActivityIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h4l2.5-7 5 14L17 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function MoonIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 4.5v15L19 12 6 4.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V5M11 19v-8M17 19V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExitDoorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 18v1.5a1.5 1.5 0 0 1-1.5 1.5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6.5A1.5 1.5 0 0 1 13 4.5V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <path d="M9 12H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 8.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <line x1="12" y1="13.5" x2="13" y2="13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

function CheckSmIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
