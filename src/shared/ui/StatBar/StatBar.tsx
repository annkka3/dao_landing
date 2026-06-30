import type { ReactNode } from "react";
import "./StatBar.css";

export type StatTone = "bankroll" | "reputation" | "stress" | "fomo" | "risk" | "discipline" | "degenIndex";

export interface StatBarProps {
  label: ReactNode;
  value: number;
  max?: number;
  change?: ReactNode;
  tone?: StatTone;
  icon?: ReactNode;
  hidden?: boolean;
}

export function StatBar({ label, value, max = 100, change, tone = "reputation", icon, hidden = false }: StatBarProps) {
  const progress = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="ui-stat-row" data-hidden={hidden || undefined}>
      <div className="ui-stat-row__label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="ui-stat-row__value text-number">
        {value} / {max}
      </div>
      <div className="ui-stat-row__bar" aria-hidden="true">
        <span className={`ui-stat-row__fill ui-stat-row__fill--${tone}`} style={{ width: `${progress}%` }} />
      </div>
      {change && <div className="ui-stat-row__change text-number">{change}</div>}
    </div>
  );
}
