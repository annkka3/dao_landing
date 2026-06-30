import type { HTMLAttributes, ReactNode } from "react";
import "./Card.css";

export type CardVariant = "basic" | "elevated" | "compact";
export type CardState = "default" | "selected" | "locked" | "disabled";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: CardVariant;
  state?: CardState;
  title?: ReactNode;
  action?: ReactNode;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  variant = "basic",
  state = "default",
  title,
  action,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <section
      className={cx("ui-card", `ui-card--${variant}`, `ui-card--${state}`, className)}
      aria-disabled={state === "disabled" || state === "locked" || undefined}
      {...props}
    >
      {(title || action) && (
        <header className="ui-card__header">
          {title && <h3 className="ui-card__title">{title}</h3>}
          {action && <div className="ui-card__action">{action}</div>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  );
}
