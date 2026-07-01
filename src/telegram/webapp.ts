declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: { start_param?: string } & Record<string, unknown>;
        colorScheme?: "light" | "dark";
        ready: () => void;
        expand: () => void;
        openTelegramLink?: (url: string) => void;
        addToHomeScreen?: () => void;
        checkHomeScreenStatus?: (callback?: (status: TelegramHomeScreenStatus) => void) => void;
        onEvent?: (eventType: string, eventHandler: (...args: unknown[]) => void) => void;
        offEvent?: (eventType: string, eventHandler: (...args: unknown[]) => void) => void;
        showAlert?: (message: string, callback?: () => void) => void;
        showPopup?: (
          params: {
            title?: string;
            message: string;
            buttons?: Array<{
              id?: string;
              type?: "default" | "ok" | "close" | "cancel" | "destructive";
              text?: string;
            }>;
          },
          callback?: (buttonId: string) => void
        ) => void;
        HapticFeedback?: {
          impactOccurred?: (style: "light" | "medium" | "heavy") => void;
          notificationOccurred?: (type: "success" | "warning" | "error") => void;
        };
      };
    };
  }
}

type ViteEnv = {
  VITE_DEV_TMA_INIT_DATA?: string;
  VITE_BOT_USERNAME?: string;
  VITE_CRYPTO_REALITY_MINIAPP_SHORT_NAME?: string;
  VITE_RISK_GUARDIAN_MINIAPP_SHORT_NAME?: string;
};
export type MiniAppLaunchView = "day_recap" | "final" | "security" | "game" | "journal" | "market";
export type TelegramHomeScreenStatus = "unsupported" | "unknown" | "added" | "missed";
type InviteLinkMode = "start" | "startapp";
type MiniAppEntryLinkMode = "shortname" | "start" | "startapp";
const HOME_SCREEN_ENTRY_STORAGE_KEY = "dao_home_screen_entry_view";

const LAUNCH_VIEW_ALIASES: Record<string, MiniAppLaunchView> = {
  crypto: "game",
  crypto_reality: "game",
  game: "game",
  journal: "journal",
  risk: "journal",
  risk_guardian: "journal",
  "risk-guardian": "journal",
  market: "market",
  dao_market: "market",
  "dao-market": "market",
};

const ENTRY_TO_LAUNCH_VIEW_ALIASES: Record<string, MiniAppLaunchView> = {
  crypt: "game",
  cr: "game",
  crypto: "game",
  cryptoreality: "game",
  crypto_reality: "game",
  "crypto-reality": "game",
  game: "game",
  journal: "journal",
  risk: "journal",
  rg: "journal",
  riskguardian: "journal",
  risk_guardian: "journal",
  "risk-guardian": "journal",
};

export function getWebApp() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
}

/**
 * Real Telegram WebApp initData, falling back to VITE_DEV_TMA_INIT_DATA for local
 * browser testing outside Telegram. The backend still validates the initData
 * signature as usual in both cases — this never bypasses auth, it only lets a
 * dev supply a real signed string when there's no Telegram client to provide one.
 */
export function getTelegramInitData(): string {
  const real = getWebApp()?.initData;
  if (real) return real;
  const devInitData = (import.meta as unknown as { env: ViteEnv }).env.VITE_DEV_TMA_INIT_DATA;
  return devInitData ?? "";
}

/** Opens a t.me link via Telegram's native handler, falling back to a new browser tab outside Telegram. */
export function openTelegramLink(url: string): void {
  const webApp = getWebApp();
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/** Opens Telegram's native share sheet for a URL, e.g. a room invite link. */
export function shareUrlToTelegram(url: string, text?: string): void {
  const params = new URLSearchParams({ url });
  if (text) params.set("text", text);
  openTelegramLink(`https://t.me/share/url?${params.toString()}`);
}

/**
 * Reads the invite/start payload from whichever source is available, in
 * priority order:
 *   1. Telegram.WebApp.initDataUnsafe.start_param — set when the app is
 *      opened via `?startapp=` or via the bot's `web_app` button deep link.
 *   2. URL param `tgWebAppStartParam` — Telegram appends this itself in some
 *      launch contexts (e.g. the web client).
 *   3. URL param `invite` — our own bot /start handler builds
 *      `MINIAPP_URL?invite=<code>` as the `?start=` deep-link fallback.
 * Returns "" if none are present.
 */
export function getTelegramRawStartParam(): string {
  const tgStartParam = getWebApp()?.initDataUnsafe?.start_param;
  if (tgStartParam) return tgStartParam;

  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("tgWebAppStartParam") || "";
}

export function getTelegramStartParam(): string {
  return getTelegramInviteStartParam();
}

export function getTelegramInviteStartParam(): string {
  const rawStartParam = getTelegramRawStartParam();
  if (rawStartParam && !parseLaunchView(rawStartParam)) return rawStartParam;

  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("invite") || "";
}

export function getMiniAppLaunchView(): MiniAppLaunchView | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return (
    parseLaunchView(params.get("view")) ||
    parseMiniAppEntryLaunchView(params.get("entry")) ||
    parseLaunchView(getTelegramRawStartParam())
  );
}

function parseLaunchView(value: string | null | undefined): MiniAppLaunchView | null {
  const normalized = (value || "").trim().toLowerCase();
  if (
    normalized === "day_recap" ||
    normalized === "final" ||
    normalized === "security" ||
    normalized === "game" ||
    normalized === "journal" ||
    normalized === "market"
  ) {
    return normalized;
  }
  return LAUNCH_VIEW_ALIASES[normalized] ?? null;
}

function parseMiniAppEntryLaunchView(value: string | null | undefined): MiniAppLaunchView | null {
  const normalized = (value || "").trim().toLowerCase();
  return ENTRY_TO_LAUNCH_VIEW_ALIASES[normalized] ?? null;
}

export function getMiniAppLaunchDayNumber(): number | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("day");
  if (!raw) return null;
  const day = Number.parseInt(raw, 10);
  return Number.isFinite(day) && day > 0 ? day : null;
}

export function normalizeTelegramBotUsername(value: string | undefined): string {
  const normalized = (value || "your_bot_username_without_at").trim().replace(/^@/, "");
  return normalized || "your_bot_username_without_at";
}

export function getTelegramBotUsername(): string {
  return normalizeTelegramBotUsername((import.meta as unknown as { env: ViteEnv }).env.VITE_BOT_USERNAME);
}

export function getTelegramBotLink(): string {
  return `https://t.me/${getTelegramBotUsername()}`;
}

function normalizeMiniAppShortName(value: string | undefined, fallback: string): string {
  const normalized = (value || fallback).trim().replace(/^\//, "");
  return normalized || fallback;
}

function getMiniAppShortName(view: MiniAppLaunchView): string | null {
  const env = (import.meta as unknown as { env: ViteEnv }).env;
  if (view === "game") {
    return normalizeMiniAppShortName(env.VITE_CRYPTO_REALITY_MINIAPP_SHORT_NAME, "CryptoReality");
  }
  if (view === "journal") {
    return normalizeMiniAppShortName(env.VITE_RISK_GUARDIAN_MINIAPP_SHORT_NAME, "RiskGuardian");
  }
  return null;
}

/**
 * Builds the shareable invite link for a room code.
 *
 * Defaults to the bot deep-link form (`?start=`) — opening it shows the bot
 * chat, and the bot's /start handler replies with a WebApp button built from
 * the current runtime MINIAPP_URL, so it always works regardless of what
 * Mini App URL is registered in BotFather. The direct `?startapp=` form
 * instead opens whatever Mini App URL is configured in BotFather, which is
 * not kept in sync with a Cloudflare Quick Tunnel's URL — pass
 * mode="startapp" only once a stable production Mini App URL is set there.
 */
export function buildInviteLink(code: string, mode: InviteLinkMode = "start"): string {
  return `${getTelegramBotLink()}?${mode}=${encodeURIComponent(code)}`;
}

export function buildMiniAppEntryLink(view: MiniAppLaunchView, mode: MiniAppEntryLinkMode = "shortname"): string {
  if (mode === "shortname") {
    const shortName = getMiniAppShortName(view);
    if (shortName) return `${getTelegramBotLink()}/${shortName}`;
    return `${getTelegramBotLink()}?startapp=${encodeURIComponent(view)}`;
  }
  return `${getTelegramBotLink()}?${mode}=${encodeURIComponent(view)}`;
}

export function setPreferredHomeScreenLaunchView(view: MiniAppLaunchView): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOME_SCREEN_ENTRY_STORAGE_KEY, view);
  } catch (err) {
    console.warn("Could not persist home-screen entry view", err);
  }
}

export function getPreferredHomeScreenLaunchView(): MiniAppLaunchView | null {
  if (typeof window === "undefined") return null;
  try {
    return parseLaunchView(window.localStorage.getItem(HOME_SCREEN_ENTRY_STORAGE_KEY));
  } catch (err) {
    console.warn("Could not read home-screen entry view", err);
    return null;
  }
}

export function showTelegramAlert(message: string): boolean {
  const webApp = getWebApp();
  if (!webApp?.showAlert) return false;
  try {
    webApp.showAlert(message);
    return true;
  } catch (err) {
    console.warn("Telegram showAlert failed", err);
    return false;
  }
}

export function showTelegramPopup(params: {
  title?: string;
  message: string;
  buttons?: Array<{
    id?: string;
    type?: "default" | "ok" | "close" | "cancel" | "destructive";
    text?: string;
  }>;
}): boolean {
  const webApp = getWebApp();
  if (!webApp?.showPopup) return false;
  try {
    webApp.showPopup(params);
    return true;
  } catch (err) {
    console.warn("Telegram showPopup failed", err);
    return false;
  }
}

export function checkTelegramHomeScreenStatus(
  callback: (status: TelegramHomeScreenStatus) => void
): boolean {
  const webApp = getWebApp();
  if (!webApp?.checkHomeScreenStatus) {
    callback("unsupported");
    return false;
  }

  try {
    webApp.checkHomeScreenStatus(callback);
    return true;
  } catch (err) {
    console.warn("Telegram checkHomeScreenStatus failed", err);
    callback("unsupported");
    return false;
  }
}

export function addTelegramMiniAppToHomeScreen(): boolean {
  const webApp = getWebApp();
  if (!webApp?.addToHomeScreen) return false;

  try {
    webApp.addToHomeScreen();
    return true;
  } catch (err) {
    console.warn("Telegram addToHomeScreen failed", err);
    return false;
  }
}

export function onTelegramHomeScreenAdded(handler: () => void): () => void {
  const webApp = getWebApp();
  if (!webApp?.onEvent) return () => undefined;

  const eventHandler = () => handler();
  webApp.onEvent("homeScreenAdded", eventHandler);
  return () => webApp.offEvent?.("homeScreenAdded", eventHandler);
}

export function onTelegramHomeScreenChecked(
  handler: (status: TelegramHomeScreenStatus) => void
): () => void {
  const webApp = getWebApp();
  if (!webApp?.onEvent) return () => undefined;

  const eventHandler = (status: unknown) => {
    if (isTelegramHomeScreenStatus(status)) handler(status);
  };
  webApp.onEvent("homeScreenChecked", eventHandler);
  return () => webApp.offEvent?.("homeScreenChecked", eventHandler);
}

function isTelegramHomeScreenStatus(value: unknown): value is TelegramHomeScreenStatus {
  return value === "unsupported" || value === "unknown" || value === "added" || value === "missed";
}

export function triggerHaptic(
  type: "success" | "warning" | "error" | "light" | "medium" | "heavy" = "success"
): void {
  const haptic = getWebApp()?.HapticFeedback;
  if (!haptic) return;

  try {
    if (type === "success" || type === "warning" || type === "error") {
      haptic.notificationOccurred?.(type);
      return;
    }

    haptic.impactOccurred?.(type);
  } catch (err) {
    console.warn("Telegram haptic feedback failed", err);
  }
}
