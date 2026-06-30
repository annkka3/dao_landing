import type { ReactNode } from "react";
import "./State.css";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  message?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, message, action, compact = false }: EmptyStateProps) {
  return (
    <section className={compact ? "ui-empty-state ui-empty-state--compact" : "ui-empty-state"}>
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      <h2 className="ui-empty-state__title">{title}</h2>
      {message && <p className="ui-empty-state__message">{message}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </section>
  );
}
