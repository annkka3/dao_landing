export type NotificationKind = "success" | "info" | "warning" | "error";
export type HapticOverride = "success" | "warning" | "error" | "light" | "medium" | "heavy";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message?: string;
  ttlMs?: number;
  /** Overrides the kind-based default haptic (e.g. an "info" toast that should still feel celebratory). */
  haptic?: HapticOverride;
};

export type NotifyInput = Omit<AppNotification, "id">;

type Listener = (notification: AppNotification) => void;

const listeners = new Set<Listener>();
const APP_NOTIFICATIONS_STORAGE_KEY = "crypto_reality_app_notifications_enabled";

function createNotification(input: NotifyInput): AppNotification {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    ttlMs: 4_000,
    ...input,
    id,
  };
}

export function subscribeNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function areAppNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(APP_NOTIFICATIONS_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setAppNotificationsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APP_NOTIFICATIONS_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage failures; notification settings should never break gameplay.
  }
}

export function notify(input: NotifyInput): void {
  if (!areAppNotificationsEnabled()) return;
  const notification = createNotification(input);
  for (const listener of listeners) {
    listener(notification);
  }
}

export function notifySuccess(title: string, message?: string): void {
  notify({ kind: "success", title, message });
}

export function notifyInfo(title: string, message?: string): void {
  notify({ kind: "info", title, message });
}

export function notifyWarning(title: string, message?: string): void {
  notify({ kind: "warning", title, message });
}

export function notifyError(title: string, message?: string): void {
  notify({ kind: "error", title, message });
}

export function hasSessionNotification(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function markSessionNotification(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Ignore storage failures; notifications should never break gameplay.
  }
}

export function notifyOnce(key: string, input: NotifyInput): boolean {
  if (hasSessionNotification(key)) return false;
  if (!areAppNotificationsEnabled()) return false;
  markSessionNotification(key);
  notify(input);
  return true;
}
