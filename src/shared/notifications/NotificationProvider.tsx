import { useEffect, useState, type ReactNode } from "react";
import { NotificationToast } from "./NotificationToast";
import { subscribeNotifications, type AppNotification, type NotificationKind } from "./notify";
import { playNotifySound } from "./sound";
import { triggerHaptic } from "../../telegram/webapp";
import "./notifications.css";

const MAX_VISIBLE_NOTIFICATIONS = 3;

// "info" has no matching Telegram notification type, so it gets a light tap
// instead of the success/warning/error haptic patterns.
const HAPTIC_BY_KIND: Record<NotificationKind, Parameters<typeof triggerHaptic>[0]> = {
  success: "success",
  warning: "warning",
  error: "error",
  info: "light",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    return subscribeNotifications((notification) => {
      setNotifications((current) => [notification, ...current].slice(0, MAX_VISIBLE_NOTIFICATIONS));
      // Centralized here so every notify*() call gets consistent feedback —
      // call sites no longer need to remember to trigger haptics themselves,
      // unless they pass an explicit `haptic` override (see notify.ts).
      triggerHaptic(notification.haptic ?? HAPTIC_BY_KIND[notification.kind]);
      playNotifySound(notification.kind);
    });
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return undefined;

    const timers = notifications.map((notification) =>
      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }, notification.ttlMs ?? 4_000)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [notifications]);

  function closeNotification(id: string) {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }

  return (
    <>
      {children}
      <div className="app-toast-stack" aria-live="polite" aria-atomic="false">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={closeNotification}
          />
        ))}
      </div>
    </>
  );
}
