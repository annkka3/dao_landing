import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import "./State.css";

export interface ErrorStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  message?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function ErrorState({ icon, title = "Что-то пошло не так", message, action, compact = false }: ErrorStateProps) {
  return (
    <EmptyState
      action={action}
      compact={compact}
      icon={icon}
      message={message}
      title={<span className="ui-error-state__title">{title}</span>}
    />
  );
}
