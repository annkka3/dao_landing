import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { HomeScreenShortcut } from "../../shared/components/HomeScreenShortcut/HomeScreenShortcut";
import { useAppContext } from "../../store/AppContext";
import {
  getArchetypes,
  getGameState,
  getLeaderboard,
  leaveRoom,
  updateLanguage,
  updateNotificationSettings,
} from "../../api/endpoints";
import { createIdempotencyKey } from "../../api/idempotency";
import { friendlyErrorMessage } from "../../api/errorMessages";
import { ConfirmModal } from "../../shared/ui/Modal/Modal";
import {
  areAppNotificationsEnabled,
  setAppNotificationsEnabled,
} from "../../shared/notifications/notify";
import { SUPPORTED_LANGUAGES, useI18n, type SupportedLanguage } from "../../shared/i18n";
import { useDaoTheme } from "../../shared/theme/ThemeProvider";
import type { DaoThemePreference } from "../../shared/theme/theme";
import { QK } from "../../store/queryClient";
import "./ProfileSettingsPage.css";

export interface ProfileSettingsPageProps {
  onBack?: () => void;
  onReturnToGame?: () => void;
  onLeftGame?: () => void;
}

export function ProfileSettingsPage({
  onBack,
  onReturnToGame,
  onLeftGame,
}: ProfileSettingsPageProps) {
  const { state, setUser } = useAppContext();
  const { language, t } = useI18n();
  const { preference: themePreference, setPreference: setThemePreference } = useDaoTheme();
  const user = state.user;
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [appNotificationsEnabled, setAppNotificationsEnabledState] = useState(
    () => areAppNotificationsEnabled()
  );

  const { data: gameState } = useQuery({ queryKey: QK.gameState, queryFn: getGameState });
  const isActive = gameState?.state === "active" && gameState.room && gameState.participant && gameState.current_day;
  const archetypeId = (gameState?.participant?.archetype_slug ?? undefined) as ArchetypeId | undefined;

  const { data: archetypesData } = useQuery({
    queryKey: QK.archetypes,
    queryFn: () => getArchetypes("ru"),
    enabled: Boolean(archetypeId),
  });
  const archetypeName = archetypesData?.items.find((a) => a.slug === archetypeId)?.name ?? archetypeId;
  const archetypeColor = archetypeId ? ARCHETYPE_COLORS[archetypeId] : "#3a8cff";

  const publicId = gameState?.room?.public_id;
  const { data: leaderboard } = useQuery({
    queryKey: publicId ? QK.leaderboard(publicId) : ["leaderboard", "pending"],
    queryFn: () => getLeaderboard(publicId as string),
    enabled: publicId != null,
  });

  const displayName = user?.username ? `@${user.username}` : user?.first_name ?? "Игрок";
  const assets = archetypeId ? archetypeAssets[archetypeId] : undefined;

  const leaveMutation = useMutation({
    mutationFn: () => {
      if (!publicId) throw new Error("No room");
      return leaveRoom(publicId, createIdempotencyKey("leave-room"));
    },
    onSuccess: () => {
      setConfirmingLeave(false);
      onLeftGame?.();
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      updateNotificationSettings({ game_bot_notifications_enabled: enabled }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });

  const languageMutation = useMutation({
    mutationFn: (languageCode: SupportedLanguage) =>
      updateLanguage({ language_code: languageCode }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });

  const notificationsEnabled = user?.game_bot_notifications_enabled ?? true;

  function toggleAppNotifications() {
    const nextEnabled = !appNotificationsEnabled;
    setAppNotificationsEnabled(nextEnabled);
    setAppNotificationsEnabledState(nextEnabled);
  }

  return (
    <main className="ps">

      {/* ── Header ── */}
      <header className="ps__header">
        <div className="ps__header-row">
          <BrandHeader />
        </div>
      </header>

      <div className="ps__frame">
        {onBack && (
          <button type="button" className="ps__back-btn" onClick={onBack}>
            <ArrowLeftIcon size={16} />
            {t("settings.back")}
          </button>
        )}

        {/* ── Page title ── */}
        <div className="ps__page-title-block">
          <div className="ps__title-row">
            <div className="ps__title-line" />
            <h1 className="ps__page-title">{t("settings.title")}</h1>
            <div className="ps__title-line" />
          </div>
          <p className="ps__page-sub">{t("settings.subtitle")}</p>
          <span className="ps__title-sub">{t("settings.description")}</span>
        </div>

        {/* ── User card ── */}
        <div className="ps__user-card">
          <div className="ps__avatar-wrap">
            <div className="ps__avatar">
              {assets ? (
                <img className="ps__avatar-img" src={assets.avatar.md} alt="" />
              ) : (
                <div className="ps__avatar-img" />
              )}
            </div>
            <div className="ps__tg-badge">
              <TelegramIcon size={12} />
            </div>
          </div>

          <div className="ps__user-info">
            <span className="ps__user-name">{displayName}</span>
            {archetypeName ? (
              <div className="ps__user-archetype">
                <ShieldIcon size={15} color={archetypeColor} />
                <span className="ps__user-archetype-name" style={{ color: archetypeColor }}>
                  {archetypeName}
                </span>
              </div>
            ) : (
              <span className="ps__user-handle">Сейчас нет активной игры</span>
            )}
            {isActive && gameState?.participant && (
              <div className="ps__user-bottom">
                <span className="ps__user-points">
                  Очки сезона: <strong>{gameState.participant.score}</strong>
                </span>
                <span className="ps__season-badge">СЕЗОН АКТИВЕН</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Текущая игра ── */}
        {isActive && gameState?.room && gameState.current_day && (
          <div className="ps__section-card">
            <div className="ps__section-header">
              <GamepadIcon size={15} color="rgba(0,229,255,0.7)" />
              <span className="ps__section-title ps__section-title--cyan">ТЕКУЩАЯ ИГРА</span>
            </div>
            <div className="ps__row">
              <div className="ps__row-icon"><UsersIcon size={16} /></div>
              <span className="ps__row-label">Комната</span>
              <span className="ps__row-value">{gameState.room.title}</span>
            </div>
            <div className="ps__row">
              <div className="ps__row-icon"><PulseIcon size={16} /></div>
              <span className="ps__row-label">Статус</span>
              <span className="ps__badge-active"><span className="ps__badge-dot" />{gameState.room.status}</span>
            </div>
            <div className="ps__row">
              <div className="ps__row-icon"><CalendarIcon size={16} /></div>
              <span className="ps__row-label">День</span>
              <span className="ps__row-value">{gameState.current_day.day_number} / {gameState.room.season_length_days}</span>
            </div>
            {leaderboard?.current_user_rank != null && (
              <div className="ps__row">
                <div className="ps__row-icon"><TrophyIcon size={16} /></div>
                <span className="ps__row-label">Место в рейтинге</span>
                <span className="ps__row-value ps__row-value--cyan">#{leaderboard.current_user_rank}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Аккаунт ── */}
        <div className="ps__section-card">
          <div className="ps__section-header">
            <UserIcon size={15} color="#3882f6" />
            <span className="ps__section-title ps__section-title--blue">{t("settings.account")}</span>
          </div>
          <div className="ps__row">
            <div className="ps__row-icon"><TelegramIcon size={16} /></div>
            <span className="ps__row-label">Подключённый Telegram</span>
            <span className="ps__connected-val">Подключён <span className="ps__badge-dot" /></span>
          </div>
          <div className="ps__row">
            <div className="ps__row-icon"><UserIcon size={16} /></div>
            <span className="ps__row-label">Telegram username</span>
            <span className="ps__row-value">{user?.username ? `@${user.username}` : "—"}</span>
          </div>
          <div className="ps__row ps__row--language">
            <div className="ps__row-icon"><GlobeIcon size={16} /></div>
            <span className="ps__row-label">
              {t("settings.language.title")}
              <span className="ps__row-hint">{t("settings.language.hint")}</span>
              {languageMutation.isError && (
                <span className="ps__row-error">{t("settings.language.error")}</span>
              )}
            </span>
            <span className="ps__language-tabs" aria-label={t("settings.language.title")}>
              {SUPPORTED_LANGUAGES.map((languageCode) => (
                <button
                  key={languageCode}
                  type="button"
                  className={`ps__language-tab${
                    language === languageCode ? " ps__language-tab--active" : ""
                  }`}
                  disabled={languageMutation.isPending || !user}
                  onClick={() => languageMutation.mutate(languageCode)}
                >
                  {t(languageCode === "ru" ? "settings.language.ru" : "settings.language.en")}
                </button>
              ))}
            </span>
          </div>
          <div className="ps__row ps__row--language">
            <div className="ps__row-icon"><PulseIcon size={16} /></div>
            <span className="ps__row-label">
              {t("settings.appearance.title")}
              <span className="ps__row-hint">{t("settings.appearance.hint")}</span>
            </span>
            <span className="ps__language-tabs" aria-label={t("settings.appearance.title")}>
              {(["system", "dark", "light"] as DaoThemePreference[]).map((preference) => (
                <button
                  key={preference}
                  type="button"
                  className={`ps__language-tab${
                    themePreference === preference ? " ps__language-tab--active" : ""
                  }`}
                  onClick={() => setThemePreference(preference)}
                >
                  {t(THEME_LABEL_KEYS[preference])}
                </button>
              ))}
            </span>
          </div>
        </div>

        {/* ── Быстрый доступ ── */}
        <HomeScreenShortcut
          title="📲 Быстрый доступ"
          body="Добавь Crypto Reality на экран телефона и открывай его как приложение."
          buttonText="Добавить на экран"
          tone="settings"
          launchView="game"
        />

        {/* ── Игра и безопасность ── */}
        <div className="ps__section-card">
          <div className="ps__section-header">
            <LockIcon size={15} color="#a855f7" />
            <span className="ps__section-title ps__section-title--purple">ИГРА И БЕЗОПАСНОСТЬ</span>
          </div>
          <button
            type="button"
            className="ps__row ps__row--button"
            disabled={!user || notificationsMutation.isPending}
            onClick={() => notificationsMutation.mutate(!notificationsEnabled)}
          >
            <div className="ps__row-icon"><BellIcon size={16} /></div>
            <span className="ps__row-label">
              {t("settings.notifications.bot")}
              <span className="ps__row-hint">
                {t("settings.notifications.botHint")}
              </span>
              {notificationsMutation.isError && (
                <span className="ps__row-error">
                  {friendlyErrorMessage(notificationsMutation.error)}
                </span>
              )}
            </span>
            <span
              className={`ps__toggle ${notificationsEnabled ? "ps__toggle--on" : ""}`}
              aria-hidden="true"
            >
              <span className="ps__toggle-knob" />
            </span>
          </button>
          <button
            type="button"
            className="ps__row ps__row--button"
            onClick={toggleAppNotifications}
          >
            <div className="ps__row-icon"><SparkIcon size={16} /></div>
            <span className="ps__row-label">
              {t("settings.notifications.app")}
              <span className="ps__row-hint">
                {t("settings.notifications.appHint")}
              </span>
            </span>
            <span
              className={`ps__toggle ${appNotificationsEnabled ? "ps__toggle--on" : ""}`}
              aria-hidden="true"
            >
              <span className="ps__toggle-knob" />
            </span>
          </button>
          <div className="ps__row">
            <div className="ps__row-icon"><ShieldCheckIcon size={16} /></div>
            <span className="ps__row-label">Дисклеймер</span>
            {user?.disclaimer_is_accepted ? (
              <span className="ps__badge-accepted">Принят <CheckIcon size={12} /></span>
            ) : (
              <span className="ps__row-value">Не принят</span>
            )}
          </div>
          <div className="ps__row">
            <div className="ps__row-icon"><InfoCircleIcon size={16} /></div>
            <span className="ps__row-label">Версия дисклеймера</span>
            <span className="ps__row-value" style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
              v{user?.disclaimer_version_accepted ?? user?.disclaimer_current_version ?? "—"}
            </span>
          </div>
        </div>

        {/* ── CTA ── */}
        <button type="button" className="ps__cta" onClick={onReturnToGame}>
          ВЕРНУТЬСЯ В ИГРУ
        </button>

        {isActive && (
          <button
            type="button"
            className="ps__cta ps__cta--danger"
            onClick={() => setConfirmingLeave(true)}
          >
            ПОКИНУТЬ ИГРУ
          </button>
        )}

      </div>

      <ConfirmModal
        open={confirmingLeave}
        title="Покинуть игру?"
        message={
          <>
            Весь прогресс и достижения этого сезона будут потеряны — отменить
            это нельзя.
            {leaveMutation.isError && (
              <p style={{ marginTop: 8, color: "#ff4d4d" }}>
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

const ARCHETYPE_COLORS: Record<ArchetypeId, string> = {
  risk_manager:        "#3a8cff",
  meme_degen:          "#b84dff",
  onchain_detective:   "#00d4ff",
  leverage_cowboy:     "#ffba00",
  hodl_monk:           "#ffd23f",
  airdrop_farmer:      "#22e6b3",
  moon_prophet:        "#39ff14",
  capitulation_doomer: "#ff3b30",
};

const THEME_LABEL_KEYS: Record<
  DaoThemePreference,
  "settings.appearance.system" | "settings.appearance.dark" | "settings.appearance.light"
> = {
  system: "settings.appearance.system",
  dark: "settings.appearance.dark",
  light: "settings.appearance.light",
};

/* ── Icons ── */

function InfoCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 9.8V13l1.6 3H4.4L6 13V9.8A6 6 0 0 1 18 9.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.8 19a2.3 2.3 0 0 0 4.4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 3.2v1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 13.9 9l5.6 2-5.6 2L12 18.5 10.1 13l-5.6-2 5.6-2L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M19 3v4M17 5h4M5 16v3M3.5 17.5h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TelegramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z" />
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

function PulseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12h4l3-7 4 14 3-7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function TrophyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 21h8M12 17v4M17 3H7l1 10a4 4 0 0 0 8 0l1-10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 3H3v4a4 4 0 0 0 4 4M19 3h2v4a4 4 0 0 1-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
      <path d="M4 20v-1a8 8 0 0 1 16 0v1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ShieldCheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GamepadIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="12" rx="4" stroke={color} strokeWidth="1.8" />
      <path d="M7 11v4M9 13H5M15 12h.01M18 12h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
