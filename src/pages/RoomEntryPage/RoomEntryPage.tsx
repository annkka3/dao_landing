import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { HoloCube } from "../../shared/ui/HoloCube/HoloCube";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { createRoom, joinRoom } from "../../api/endpoints";
import { createIdempotencyKey } from "../../api/idempotency";
import { ApiError } from "../../api/errors";
import { friendlyErrorMessage } from "../../api/errorMessages";
import type { ParticipantDTO, RoomDTO } from "../../api/types";
import { useAppContext } from "../../store/AppContext";
import { getTelegramStartParam } from "../../telegram/webapp";
import "./RoomEntryPage.css";

export interface RoomEntryPageProps {
  timezone?: string;
  onCreateRoom?: (room: RoomDTO, participant: ParticipantDTO) => void;
  onJoinRoom?: (room: RoomDTO, participant: ParticipantDTO) => void;
  onBack?: () => void;
}

export type RoomMode = "regular" | "demo" | "fast_forward";

/** Only allow-listed Telegram test accounts ever get `?ff=1` in their WebApp
 * URL (added by the bot's /start handler) — regular users never see this
 * toggle. The actual access control is server-side (telegram_id allowlist);
 * this just keeps the option out of the way for everyone else. */
function fastForwardAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("ff") === "1";
}

export function RoomEntryPage({
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: RoomEntryPageProps) {
  const { state } = useAppContext();
  const [roomName, setRoomName] = useState("");
  const [mode, setMode] = useState<RoomMode>("regular");
  // Pre-fill from an invite/start_param if the app was opened via an invite
  // link (?invite=, ?tgWebAppStartParam=, or Telegram's own start_param).
  const [inviteCode, setInviteCode] = useState(() => getTelegramStartParam());
  const [hasFastForwardFlag] = useState(fastForwardAvailable);
  const showFastForward = Boolean(state.user?.can_fast_forward || hasFastForwardFlag);

  const codeReady = inviteCode.trim().length >= 4;

  const createMutation = useMutation({
    mutationFn: () =>
      createRoom(
        {
          title: roomName.trim() || "Моя комната",
          timezone,
          demo_mode: mode === "demo",
          fast_forward_mode: mode === "fast_forward",
        },
        createIdempotencyKey("create-room")
      ),
    onSuccess: ({ room, participant }) => onCreateRoom?.(room, participant),
  });

  const joinMutation = useMutation({
    mutationFn: () =>
      joinRoom({ invite_code: inviteCode.trim() }, createIdempotencyKey("join-room")),
    onSuccess: ({ room, participant }) => onJoinRoom?.(room, participant),
  });
  const joinBlockedByActiveGame =
    ApiError.isApiError(joinMutation.error) && joinMutation.error.code === "ACTIVE_GAME_ALREADY_EXISTS";

  return (
    <main className="re">

      {/* ── Header ── */}
      <header className="re__header">
        <BrandHeader />
        <div className="re__title-row">
          <div className="re__title-line" />
          <h1 className="re__page-title">JOIN OR CREATE</h1>
          <div className="re__title-line" />
        </div>
        <p className="re__page-sub">— КОМНАТА —</p>
      </header>

      <div className="re__frame">

        {/* ── Title ── */}
        <div className="re__title-block">
          <p className="re__subtitle">
            Собери свою комнату или введи код приглашения и выживи{" "}
            <span className="re__subtitle-accent">7 дней</span> крипто-хаоса.
          </p>
        </div>

        {/* ── Section 1: Create Room ── */}
        <section className="re__card re__card--create">
          <div className="re__card-corner re__card-corner--tl" />
          <div className="re__card-corner re__card-corner--tr" />

          <div className="re__card-header">
            <div className="re__card-icon re__card-icon--cyan">
              <HexPlusIcon size={22} />
            </div>
            <h2 className="re__card-title re__card-title--cyan">1. Создать комнату</h2>
          </div>

          <div className="re__input-wrap re__input-wrap--cyan">
            <ChatIcon size={20} className="re__input-icon" />
            <input
              className="re__input"
              placeholder="Например: Комната Анны"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div
            className={`re__setting-row re__setting-row--segmented ${
              showFastForward ? "re__setting-row--segmented-stack" : ""
            }`}
          >
            <div className="re__setting-label">
              <GridIcon size={18} />
              <span>Режим игры</span>
            </div>
            <div
              className={`re__segmented ${showFastForward ? "re__segmented--triple" : ""}`}
              role="group"
              aria-label="Режим игры"
            >
              <button
                type="button"
                className={`re__seg-btn ${mode === "regular" ? "re__seg-btn--active" : ""}`}
                onClick={() => setMode("regular")}
                aria-pressed={mode === "regular"}
              >
                <UsersIcon size={13} /> Обычная
              </button>
              <button
                type="button"
                className={`re__seg-btn ${mode === "demo" ? "re__seg-btn--active" : ""}`}
                onClick={() => setMode("demo")}
                aria-pressed={mode === "demo"}
              >
                <UserIcon size={13} /> Демо
              </button>
              {showFastForward && (
                <button
                  type="button"
                  className={`re__seg-btn ${mode === "fast_forward" ? "re__seg-btn--active" : ""}`}
                  onClick={() => setMode("fast_forward")}
                  aria-pressed={mode === "fast_forward"}
                >
                  ⚡ Ускоренный
                </button>
              )}
            </div>
          </div>

          <div className="re__setting-row">
            <div className="re__setting-label">
              <GlobeIcon size={18} />
              <span>Часовой пояс</span>
            </div>
            <span className="re__setting-value">{timezone}</span>
          </div>

          <p className="re__note">
            <InfoCircleIcon size={15} />
            <span><strong>1</strong> активная игра на игрока</span>
          </p>

          {createMutation.isError && (
            <p className="re__note">
              {ApiError.isApiError(createMutation.error)
                ? createMutation.error.message
                : "Не удалось создать комнату"}
            </p>
          )}

          <button
            className="re__action-btn re__action-btn--create"
            type="button"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <HexPlusIcon size={19} />
            {createMutation.isPending ? "Создаём..." : "Создать комнату"}
          </button>
        </section>

        {/* ── Section 2: Join by Code ── */}
        <section className="re__card re__card--join">
          <div className="re__card-header">
            <div className="re__card-icon re__card-icon--purple">
              <KeyIcon size={22} />
            </div>
            <h2 className="re__card-title re__card-title--purple">2. Войти по коду</h2>
          </div>

          <div className="re__input-wrap re__input-wrap--purple">
            <KeyIcon size={20} className="re__input-icon" />
            <input
              className="re__input re__input--code"
              placeholder="ABCD-7421"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={9}
              inputMode="text"
            />
          </div>
          <p className="re__helper">Код пришлет создатель комнаты</p>

          {joinMutation.isError && (
            <p className="re__helper">
              {joinBlockedByActiveGame
                ? "Ты уже в другой активной комнате. Перейди в неё и нажми «Покинуть комнату», затем вернись к этому приглашению."
                : friendlyErrorMessage(joinMutation.error, "Не удалось войти в комнату")}
            </p>
          )}

          {joinBlockedByActiveGame && state.currentRoom && onBack && (
            <button className="re__back-btn" type="button" onClick={onBack}>
              <ArrowLeftIcon size={18} />
              Открыть текущую комнату
            </button>
          )}

          <button
            className="re__action-btn re__action-btn--join"
            type="button"
            disabled={!codeReady || joinMutation.isPending}
            onClick={() => joinMutation.mutate()}
          >
            <DoorEnterIcon size={19} />
            {joinMutation.isPending ? "Входим..." : "Войти в комнату"}
          </button>
        </section>

        {/* ── Section 3: How it works ── */}
        <section className="re__card re__card--steps">
          <div className="re__card-header">
            <div className="re__card-icon re__card-icon--green">
              <QuestionIcon size={22} />
            </div>
            <h2 className="re__card-title re__card-title--green">Как это работает</h2>
          </div>
          <div className="re__steps-body">
            <ol className="re__steps">
              <li><span>1</span>Создай комнату или получи invite code</li>
              <li><span>2</span>Выбери архетип и дождись старта</li>
              <li><span>3</span>Проходи события 7 дней и лезь в лидерборд</li>
            </ol>
            <div className="re__steps-cube">
              <HoloCube size={72} />
            </div>
          </div>
        </section>

        <p className="re__disclaimer">
          <ShieldIcon size={14} /> Развлекательная игра. Не финансовый совет.
        </p>

        {onBack && (
          <button className="re__back-btn" type="button" onClick={onBack}>
            <ArrowLeftIcon size={18} />
            Назад
          </button>
        )}

      </div>
    </main>
  );
}

/* ── Inline SVG icons ── */

function HexPlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 20v-1a6 6 0 0 0-5-5.93" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function InfoCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8h.01M12 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function KeyIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14.5 9.5a4 4 0 1 1-1.1-2.77L21 14.33V18h-3.67v-2.33H15v-2.34h-2.33l-1.27-1.27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function DoorEnterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 18v1.5a1.5 1.5 0 0 0 1.5 1.5H19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-6.5A1.5 1.5 0 0 0 11 4.5V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 12H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 8.5L2 12l4 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
