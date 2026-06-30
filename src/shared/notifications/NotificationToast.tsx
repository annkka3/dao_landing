import type { AppNotification } from "./notify";

const ICON_BY_KIND: Record<AppNotification["kind"], (p: { size?: number }) => JSX.Element> = {
  success: SuccessIcon,
  info: InfoIcon,
  warning: WarningIcon,
  error: ErrorIcon,
};

export interface NotificationToastProps {
  notification: AppNotification;
  onClose: (id: string) => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const Icon = ICON_BY_KIND[notification.kind];
  return (
    <div className={`app-toast app-toast--${notification.kind}`} role="status">
      <div className="app-toast__icon" aria-hidden="true">
        <Icon size={16} />
      </div>
      <div className="app-toast__body">
        <div className="app-toast__title">{notification.title}</div>
        {notification.message && <div className="app-toast__message">{notification.message}</div>}
      </div>
      <button
        className="app-toast__close"
        type="button"
        aria-label="Закрыть уведомление"
        onClick={() => onClose(notification.id)}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

/* ── Icons ── */

function SuccessIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
