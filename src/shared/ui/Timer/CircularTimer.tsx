import "./Timer.css";

export interface CircularTimerProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
}

export function CircularTimer({ value, max = 100, label, size = 112 }: CircularTimerProps) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, value / max));
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="ui-circular-timer" style={{ width: size, height: size }}>
      <svg viewBox="0 0 112 112" className="ui-circular-timer__svg" aria-hidden="true">
        <circle className="ui-circular-timer__track" cx="56" cy="56" r={radius} />
        <circle
          className="ui-circular-timer__progress"
          cx="56"
          cy="56"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="ui-circular-timer__content">
        <span className="ui-circular-timer__value text-number">{value}</span>
        {label && <span className="ui-circular-timer__label">{label}</span>}
      </div>
    </div>
  );
}
