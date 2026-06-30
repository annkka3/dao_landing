import type { CSSProperties, ReactNode } from "react";
import { Badge } from "../../../../shared/ui/Badge/Badge";
import "./EventCard.css";

export type EventCardState = "available" | "completed" | "missed" | "locked" | "urgent";
export type EventTimeTone = "morning" | "day" | "eveningBonus";

export interface EventCardProps {
  title: string;
  dayLabel: string;
  description: ReactNode;
  timeLeft?: string;
  tags?: string[];
  reward?: ReactNode;
  risk?: ReactNode;
  state?: EventCardState;
  timeTone?: EventTimeTone;
  icon?: ReactNode;
  accent?: string;
  action?: ReactNode;
}

export function EventCard({
  title,
  dayLabel,
  description,
  timeLeft,
  tags = [],
  reward,
  risk,
  state = "available",
  timeTone = "day",
  icon,
  accent = "var(--color-game-bonus)",
  action,
}: EventCardProps) {
  return (
    <article className={`game-event-card game-event-card--${state} game-event-card--${timeTone}`} style={{ "--event-accent": accent } as CSSProperties}>
      <header className="game-event-card__header">
        <div>
          <div className="game-event-card__day">{dayLabel}</div>
          <h3>{title}</h3>
        </div>
        {icon && <div className="game-event-card__icon">{icon}</div>}
      </header>
      <div className="game-event-card__description">{description}</div>
      <div className="game-event-card__tags">
        {tags.map((tag) => (
          <Badge key={tag} tone={state === "urgent" ? "danger" : "info"}>
            {tag}
          </Badge>
        ))}
      </div>
      {(reward || risk) && (
        <div className="game-event-card__meta">
          {reward && <span>{reward}</span>}
          {risk && <span>{risk}</span>}
        </div>
      )}
      {timeLeft && <div className="game-event-card__timer text-number">{timeLeft}</div>}
      {action && <div className="game-event-card__action">{action}</div>}
    </article>
  );
}
