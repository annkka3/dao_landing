import type { ReactNode } from "react";
import { Card, type CardState } from "./Card";
import "./Card.css";

export interface GameCardProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  media?: ReactNode;
  state?: CardState;
  compact?: boolean;
  children?: ReactNode;
}

export function GameCard({
  title,
  eyebrow,
  meta,
  footer,
  media,
  state = "default",
  compact = false,
  children,
}: GameCardProps) {
  return (
    <Card variant={compact ? "compact" : "elevated"} state={state} className="ui-game-card">
      {media && <div className="ui-game-card__media">{media}</div>}
      <div className="ui-game-card__content">
        {eyebrow && <div className="ui-game-card__eyebrow">{eyebrow}</div>}
        <div className="ui-game-card__topline">
          <h3 className="ui-game-card__title">{title}</h3>
          {meta && <div className="ui-game-card__meta">{meta}</div>}
        </div>
        {children && <div className="ui-game-card__description">{children}</div>}
        {footer && <div className="ui-game-card__footer">{footer}</div>}
      </div>
    </Card>
  );
}
