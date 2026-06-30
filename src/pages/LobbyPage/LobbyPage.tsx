import { useEffect, useState, type CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { archetypeAccentFor } from "../../shared/assets/archetypePresentation";
import { HoloCR } from "../../shared/ui/HoloCR/HoloCR";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { useAppContext } from "../../store/AppContext";
import { QK } from "../../store/queryClient";
import {
  cancelRoom,
  getArchetypes,
  getRoomEventFeed,
  getRoomParticipants,
  leaveRoom,
  startRoom,
} from "../../api/endpoints";
import { createIdempotencyKey } from "../../api/idempotency";
import { friendlyErrorMessage } from "../../api/errorMessages";
import type { ParticipantDTO, RoomDTO, RoomEventFeedItemDTO } from "../../api/types";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import { ConfirmModal } from "../../shared/ui/Modal/Modal";
import { ActiveRoomScreen } from "./ActiveRoomScreen";
import { EquippedMarketBadge } from "../../features/market/components/EquippedMarketBadge";
import { EquippedRoomThemeShell } from "../../features/market/components/EquippedRoomThemeShell";
import { getArchetypeAssetsWithSkin, getEquippedRoomTheme } from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import "./LobbyPage.css";

export interface LobbyPageProps {
  onChooseArchetype?: () => void;
  onStartGame?: (room: RoomDTO, participant: ParticipantDTO) => void;
  onInvite?: () => void;
  onCancelled?: () => void;
  onNoRoom?: () => void;
  onOpenEvent?: () => void;
  onFinal?: () => void;
}

export function LobbyPage({
  onChooseArchetype,
  onStartGame,
  onInvite,
  onCancelled,
  onNoRoom,
  onOpenEvent,
  onFinal,
}: LobbyPageProps) {
  const { state, setCurrentRoom } = useAppContext();
  const queryClient = useQueryClient();
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [eventFeedExpanded, setEventFeedExpanded] = useState(false);
  const room = state.currentRoom;
  const participant = state.currentParticipant;

  const roomName = room?.title ?? "Без названия";
  const roomCode = room?.invite_code ?? "------";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
  };
  const isHost = participant?.is_creator ?? false;
  const myArchetypeId = (participant?.archetype_slug ?? undefined) as ArchetypeId | undefined;
  const hasArchetype = Boolean(myArchetypeId);
  const myArchetypeAccent = archetypeAccentFor(myArchetypeId);

  const { data: archetypesData } = useQuery({
    queryKey: QK.archetypes,
    queryFn: () => getArchetypes("ru"),
    enabled: hasArchetype || room != null,
  });
  const myArchetypeInfo = archetypesData?.items.find((a) => a.slug === myArchetypeId);
  const myArchetypeName = myArchetypeInfo?.name ?? myArchetypeId ?? "";
  const myArchetypeTagline = myArchetypeInfo?.description;

  const { data: participantsData } = useQuery({
    queryKey: room ? QK.roomParticipants(room.public_id) : ["roomParticipants", "pending"],
    queryFn: () => getRoomParticipants(room!.public_id),
    enabled: room != null,
  });
  const { data: eventFeedData } = useQuery({
    queryKey: room ? QK.roomEventFeed(room.public_id) : ["roomEventFeed", "pending"],
    queryFn: () => getRoomEventFeed(room!.public_id, 30),
    enabled: room != null,
    refetchInterval: room?.status === "active" ? 15_000 : false,
  });
  const { data: equippedItemsData } = useEquippedItems(room != null);
  const currentAssets = myArchetypeId
    ? getArchetypeAssetsWithSkin(myArchetypeId, equippedItemsData?.items ?? [])
    : undefined;
  const cutoutSrc = currentAssets?.cutout.neutral;
  const startingStats = myArchetypeInfo?.starting_stats;

  useEffect(() => {
    if (room?.status === "cancelled") {
      onNoRoom?.();
    }
  }, [room?.status, onNoRoom]);

  const startMutation = useMutation({
    mutationFn: () => {
      if (!room) throw new Error("No room");
      return startRoom(room.public_id, createIdempotencyKey("start-room"));
    },
    onSuccess: (data) => {
      const me =
        data.participants.find((p) => p.id === participant?.id) ??
        data.participants.find((p) => p.is_creator) ??
        data.participants[0] ??
        participant ??
        null;

      setCurrentRoom(data.room, me);
      void queryClient.invalidateQueries({ queryKey: QK.currentRoom });
      void queryClient.invalidateQueries({ queryKey: QK.roomParticipants(data.room.public_id) });
      void queryClient.invalidateQueries({ queryKey: QK.roomEventFeed(data.room.public_id) });
      void queryClient.invalidateQueries({ queryKey: QK.gameState });
      void queryClient.invalidateQueries({ queryKey: QK.leaderboard(data.room.public_id) });

      if (me) onStartGame?.(data.room, me);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!room) throw new Error("No room");
      return cancelRoom(room.public_id, createIdempotencyKey("cancel-room"));
    },
    onSuccess: ({ room: cancelledRoom }) => {
      setCurrentRoom(cancelledRoom, null);
      onCancelled?.();
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => {
      if (!room) throw new Error("No room");
      return leaveRoom(room.public_id, createIdempotencyKey("leave-room"));
    },
    onSuccess: () => {
      setConfirmingLeave(false);
      setCurrentRoom(null, null);
      void queryClient.invalidateQueries({ queryKey: QK.currentRoom });
      void queryClient.invalidateQueries({ queryKey: QK.gameState });
      onNoRoom?.();
    },
  });

  if (!room) {
    return (
      <ErrorState
        title="Лобби пока пусто"
        message="Сейчас нет комнаты в лобби."
        action={onNoRoom && <button type="button" onClick={onNoRoom}>На главную</button>}
      />
    );
  }

  if (room.status === "cancelled") {
    return null;
  }

  const isLobbyStatus = room.status === "lobby";
  const isActiveStatus = room.status === "active";
  const isFinishedStatus = room.status === "finished";
  const isRoomSceneStatus = isActiveStatus || isFinishedStatus;
  const roomParticipants = participantsData?.participants ?? [];
  const roomCapacity = 4;
  const readyCount = roomParticipants.filter((p) => p.has_archetype).length;
  const roomSlots = Array.from({ length: Math.max(roomCapacity, roomParticipants.length) }, (_, index) => roomParticipants[index] ?? null);
  const eventFeedItems = eventFeedData?.items ?? [];
  const roomTheme = getEquippedRoomTheme(equippedItemsData?.items ?? []);
  const visibleEventFeedItems = eventFeedExpanded
    ? eventFeedItems
    : eventFeedItems.slice(0, 5);
  const canToggleEventFeed = eventFeedItems.length > 5;

  return (
    <main className="lobby">

      {/* ── Header ── */}
      <header className="lobby__header">
        <div className={`lobby__brand-row${isRoomSceneStatus ? " lobby__brand-row--active" : ""}`}>
          <BrandHeader
            wordmarkVariant={isRoomSceneStatus ? "gradient" : "split"}
            align="left"
            showIcon={!isRoomSceneStatus}
          />
        </div>
        <div className="lobby__title-row">
          <div className="lobby__title-line" />
          <h1 className="lobby__page-title">{isLobbyStatus ? "ROOM LOBBY" : "ROOM"}</h1>
          <div className="lobby__title-line" />
        </div>
        <p className={`lobby__page-sub${isLobbyStatus ? "" : " lobby__page-sub--room"}`}>
          {isLobbyStatus ? "— ЛОББИ КОМНАТЫ —" : "— КОМНАТА —"}
        </p>
      </header>

      <div className="lobby__frame">
        <EquippedRoomThemeShell theme={roomTheme} className="lobby__market-theme-shell">
        {roomTheme && (
          <div className="lobby__market-theme-badge">
            <EquippedMarketBadge label="Тема комнаты" item={roomTheme} />
          </div>
        )}

        {isRoomSceneStatus && room ? (
          <ActiveRoomScreen
            room={room}
            participant={participant}
            participants={participantsData?.participants ?? []}
            archetypesData={archetypesData}
            eventFeedItems={eventFeedItems}
            visibleEventFeedItems={visibleEventFeedItems}
                canToggleEventFeed={canToggleEventFeed}
                eventFeedExpanded={eventFeedExpanded}
                onToggleEventFeed={() => setEventFeedExpanded((expanded) => !expanded)}
                onOpenEvent={onOpenEvent}
                onFinal={onFinal}
                onInvite={onInvite}
            onLeave={() => setConfirmingLeave(true)}
            leavePending={leaveMutation.isPending}
            seasonFinished={isFinishedStatus}
          />
        ) : (
        <>
        {/* ── Title ── */}
        <div className={`lobby__title-block${isLobbyStatus ? "" : " lobby__title-block--room"}`}>
          <p className="lobby__subtitle">
            {isLobbyStatus ? (
              <>Собери игроков, выбери архетип и дождись{" "}
                <span className="lobby__subtitle-accent">старта.</span></>
            ) : isFinishedStatus ? (
              <>Сезон завершён — <span className="lobby__subtitle-accent">итоги сохранены в комнате.</span></>
            ) : (
              <>Игра уже идёт — <span className="lobby__subtitle-accent">удачи в крипто-хаосе.</span></>
            )}
          </p>
        </div>

        {/* ── Room card ── */}
        <section className="lobby__room-card">
          <div className="lobby__room-card-corner lobby__room-card-corner--tl" />
          <div className="lobby__room-card-corner lobby__room-card-corner--tr" />
          <div className="lobby__room-card-corner lobby__room-card-corner--bl" />
          <div className="lobby__room-card-corner lobby__room-card-corner--br" />

          <div className="lobby__room-cube">
            <HoloCR size={94} />
          </div>
          <div className="lobby__room-info">
            <span className="lobby__room-name-label">Название комнаты</span>
            <span className="lobby__room-name">{roomName}</span>
            <button className="lobby__room-code-section" type="button" onClick={handleCopyCode}>
              <span className="lobby__room-code-label">Код комнаты</span>
              <span className="lobby__room-code-val">
                <span>{roomCode}</span>
                <CopyIcon size={14} />
              </span>
            </button>
          </div>

          <div className="lobby__room-state-grid">
            <div className="lobby__room-state">
              <span className="lobby__room-state-label">Статус</span>
              <span className="lobby__room-state-val">
                {isLobbyStatus ? "Ожидание игроков" : isFinishedStatus ? "Завершена" : "Игра идёт"}
              </span>
            </div>
            <div className="lobby__ready-hex">
              <span className="lobby__ready-count">{readyCount} / {Math.max(roomCapacity, roomParticipants.length)}</span>
              <span className="lobby__ready-label">готовы</span>
            </div>
          </div>
        </section>

        {/* ── Archetype status card ── */}
        <section
          className="lobby__status-card"
          style={{ "--arch-accent": myArchetypeAccent } as CSSProperties}
        >
          <div className="lobby__status-header">
            <span className="lobby__status-header-label">Твой архетип</span>
            {hasArchetype && <span className="lobby__status-ready-badge">Твой выбор</span>}
          </div>
          <div className="lobby__status-top">
            {hasArchetype && cutoutSrc ? (
              <div className="lobby__status-art">
                <img src={cutoutSrc} alt={myArchetypeName ?? ""} />
              </div>
            ) : (
              <div className="lobby__status-question-block">
                <span>?</span>
              </div>
            )}
            <div className="lobby__status-body">
              {hasArchetype ? (
                <>
                  <span className="lobby__status-name">{myArchetypeName}</span>
                  {myArchetypeTagline && (
                    <span className="lobby__status-tagline">{myArchetypeTagline}</span>
                  )}
                  {startingStats && (
                    <div className="lobby__status-stats">
                      {(
                        [
                          ["bankroll", "Банкролл", startingStats.bankroll],
                          ["stress", "Стресс", startingStats.stress],
                          ["reputation", "Репутация", startingStats.reputation],
                        ] as const
                      ).map(([icon, label, value]) => (
                        <div key={label} className="lobby__status-stat">
                          <div className="lobby__status-stat-head">
                            <StatIcon type={icon} />
                            <span className="lobby__status-stat-label">{label}</span>
                          </div>
                          <span className={`lobby__status-stat-val ${value < 0 ? "lobby__status-stat-val--neg" : "lobby__status-stat-val--pos"}`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className="lobby__status-name lobby__status-name--empty">Архетип не выбран</span>
                  <span className="lobby__status-desc">Выбери стиль игры перед стартом.</span>
                </>
              )}
            </div>
          </div>
          {isLobbyStatus && (
            <button className="lobby__archetype-btn" type="button" onClick={onChooseArchetype}>
              {hasArchetype ? "Изменить архетип" : "Выбрать архетип"}
            </button>
          )}
        </section>

        {/* ── Participants ── */}
        <section className="lobby__participants">
          <h3 className="lobby__participants-title">
            <UsersIcon size={15} /> Участники комнаты ({roomParticipants.length}/{Math.max(roomCapacity, roomParticipants.length)})
          </h3>
          <div className="lobby__participants-list">
            {roomSlots.map((p, index) => {
              if (!p) {
                const isInviteSlot = index === roomParticipants.length;
                return (
                  <button
                    key={`slot-${index}`}
                    className="lobby__participant-row lobby__participant-row--slot"
                    type="button"
                    onClick={isInviteSlot ? onInvite : undefined}
                  >
                    <div className="lobby__participant-avatar lobby__participant-avatar--plus">
                      <PlusIcon size={18} />
                    </div>
                    <div className="lobby__participant-info">
                      <span className="lobby__participant-name">
                        {isInviteSlot ? "Пригласить игрока" : "Свободный слот"}
                      </span>
                    </div>
                  </button>
                );
              }
                const pArchetypeId = (p.archetype_slug ?? undefined) as ArchetypeId | undefined;
                const pAvatar = pArchetypeId ? archetypeAssets[pArchetypeId].avatar.sm : undefined;
                const pArchetypeName =
                  archetypesData?.items.find((a) => a.slug === pArchetypeId)?.name ?? p.archetype_slug;
                return (
                  <div key={p.participant_id} className="lobby__participant-row">
                    <div className="lobby__participant-avatar">
                      {pAvatar ? (
                        <img src={pAvatar} alt="" />
                      ) : (
                        <span className="lobby__participant-avatar-empty">?</span>
                      )}
                      {p.is_creator && (
                        <span className="lobby__participant-crown" aria-label="Создатель комнаты">
                          <CrownIcon size={12} />
                        </span>
                      )}
                    </div>
                    <div className="lobby__participant-info">
                      <span className="lobby__participant-name">{p.display_name}</span>
                      {p.has_archetype && pArchetypeName && (
                        <span className="lobby__participant-archetype">{pArchetypeName}</span>
                      )}
                    </div>
                    <span
                      className={`lobby__participant-badge ${
                        p.has_archetype
                          ? "lobby__participant-badge--ready"
                          : "lobby__participant-badge--empty"
                      }`}
                    >
                      {p.has_archetype ? "Готов" : "Нет архетипа"}
                    </span>
                  </div>
                );
            })}
          </div>
        </section>

        <section className="lobby__event-feed">
          <h3 className="lobby__event-feed-title">
            <ActivityIcon size={15} /> DAO terminal
          </h3>
          <div className="lobby__terminal">
            <TerminalLine text="Комната создана" />
            {roomParticipants
              .filter((p) => p.has_archetype)
              .slice(0, 3)
              .map((p) => {
                const pArchetypeName =
                  archetypesData?.items.find((a) => a.slug === p.archetype_slug)?.name ?? p.archetype_slug ?? "архетип";
                return (
                  <TerminalLine
                    key={p.participant_id}
                    text={`${p.display_name} выбрал архетип ${pArchetypeName}`}
                  />
                );
              })}
            <TerminalLine text="Ожидание запуска сезона" dim />
          </div>
        </section>

        {/* ── Actions ── */}
        {startMutation.isError && (
          <p className="lobby__status-desc">{friendlyErrorMessage(startMutation.error)}</p>
        )}
        {cancelMutation.isError && (
          <p className="lobby__status-desc">{friendlyErrorMessage(cancelMutation.error)}</p>
        )}
        {leaveMutation.isError && (
          <p className="lobby__status-desc">{friendlyErrorMessage(leaveMutation.error)}</p>
        )}
        <div className="lobby__actions">
          {isLobbyStatus && isHost && (
            <button
              className="lobby__action-btn lobby__action-btn--start"
              type="button"
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate()}
            >
              <PlayIcon size={17} />
              <span>{startMutation.isPending ? "Запускаем..." : "Начать игру"}</span>
            </button>
          )}
          {isFinishedStatus && onFinal && (
            <button className="lobby__action-btn lobby__action-btn--start" type="button" onClick={onFinal}>
              <ChartIcon size={17} />
              <span>Посмотреть финал</span>
            </button>
          )}
          {!isFinishedStatus && (
            <button className="lobby__action-btn lobby__action-btn--invite" type="button" onClick={onInvite}>
              <SendIcon size={17} />
              Пригласить друзей
            </button>
          )}
          {!isLobbyStatus && (
            <button
              className="lobby__action-btn lobby__action-btn--leave"
              type="button"
              disabled={leaveMutation.isPending}
              onClick={() => setConfirmingLeave(true)}
            >
              <ExitDoorIcon size={17} />
              {leaveMutation.isPending ? "Выходим..." : "Покинуть комнату"}
            </button>
          )}
          {isLobbyStatus && (
            <button
              className="lobby__cancel-link"
              type="button"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? "Отменяем..." : "Отменить лобби"}
            </button>
          )}
        </div>
        </>
        )}
        </EquippedRoomThemeShell>

      </div>

      <div className="lobby__disclaimer">
        <span aria-hidden="true">◇</span> Развлекательная игра. Не финансовый совет.
      </div>

      <ConfirmModal
        open={confirmingLeave}
        title="Покинуть комнату?"
        message={
          <>
            Прогресс в этой игре будет потерян. Вернуться в эту комнату с тем же
            прогрессом не получится.
            {leaveMutation.isError && (
              <p className="lobby__leave-error">
                {friendlyErrorMessage(leaveMutation.error)}
              </p>
            )}
          </>
        }
        confirmLabel={leaveMutation.isPending ? "Выходим..." : "Покинуть"}
        cancelLabel="Остаться"
        danger
        onConfirm={() => leaveMutation.mutate()}
        onCancel={() => setConfirmingLeave(false)}
      />
    </main>
  );
}

/* ── Inline SVG icons (currentColor works, no img filter needed) ── */

export function eventFeedActionLabel(item: RoomEventFeedItemDTO): string {
  if (item.status === "missed") return "Событие пропущено";
  if (item.event_type === "evening_bonus") return "Бонусное событие пройдено";
  return "Событие пройдено";
}

export function eventFeedWindowLabel(item: RoomEventFeedItemDTO): string {
  if (item.event_type === "morning") return `День ${item.day_number} · Утро`;
  if (item.event_type === "day") return `День ${item.day_number} · День`;
  return `День ${item.day_number} · Вечерний бонус`;
}

export function formatScoreDelta(value: number): string {
  if (value > 0) return `+${Math.round(value)}`;
  return `${Math.round(value)}`;
}

function TerminalLine({ text, dim = false }: { text: string; dim?: boolean }) {
  return (
    <div className={`lobby__terminal-line${dim ? " lobby__terminal-line--dim" : ""}`}>
      <span className="lobby__terminal-prompt">&gt;</span>
      <span className="lobby__terminal-time">system</span>
      <span className="lobby__terminal-text">{text}</span>
    </div>
  );
}

function ActivityIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h4l2.5-7 5 14L17 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* outlined triangle — matches design stroke-only style */}
      <path d="M6 4.5v15L19 12 6 4.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* paper plane — matches Telegram-style send icon in design */}
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatIcon({ type }: { type?: "bankroll" | "stress" | "reputation" }) {
  if (type === "bankroll") {
    return (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="lobby__status-stat-icon" aria-hidden="true">
        <rect x="0.5" y="3.5" width="11" height="7" rx="1" stroke="#22c55e" strokeWidth="1.2" />
        <circle cx="6" cy="7" r="1.8" stroke="#22c55e" strokeWidth="1.2" />
        <path d="M3 3.5V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1" stroke="#22c55e" strokeWidth="1.2" />
      </svg>
    );
  }
  if (type === "stress") {
    return (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="lobby__status-stat-icon" aria-hidden="true">
        <path d="M0.5 6H2.5L4 2.5L6 9L8 4.5L9.5 6H11.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "reputation") {
    return (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="lobby__status-stat-icon" aria-hidden="true">
        <path d="M6 1L7.2 4.4H11L8.1 6.5L9.3 10L6 8L2.7 10L3.9 6.5L1 4.4H4.8L6 1Z" stroke="#63dfff" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

function ExitDoorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* door frame open on right + arrow — matches CANCEL LOBBY design */}
      <path d="M13 18v1.5a1.5 1.5 0 0 1-1.5 1.5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6.5A1.5 1.5 0 0 1 13 4.5V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <path d="M9 12H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 8.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      <line x1="12" y1="13.5" x2="13" y2="13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 10a3 3 0 1 0 0-6M21 20v-1a6 6 0 0 0-4-5.66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CrownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 19h18l-1.5-9-4.5 3.5L12 6l-3 7.5L4.5 10 3 19z" />
    </svg>
  );
}
