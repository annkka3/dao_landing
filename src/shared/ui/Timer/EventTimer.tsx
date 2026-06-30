import "./Timer.css";

export type TimerTone = "default" | "warning" | "danger" | "success" | "locked" | "expired";

export interface EventTimerProps {
  label: string;
  value: string;
  tone?: TimerTone;
}

export function EventTimer({ label, value, tone = "default" }: EventTimerProps) {
  return (
    <div className={`ui-event-timer ui-event-timer--${tone}`}>
      <span className="ui-event-timer__icon" aria-hidden="true" />
      <span className="ui-event-timer__content">
        <span className="ui-event-timer__value text-number">{value}</span>
        <span className="ui-event-timer__label">{label}</span>
      </span>
    </div>
  );
}
