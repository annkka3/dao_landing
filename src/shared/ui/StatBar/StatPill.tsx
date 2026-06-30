import type { ReactNode } from "react";
import type { StatTone } from "./StatBar";
import "./StatBar.css";

export interface StatPillProps {
  label: ReactNode;
  value: ReactNode;
  tone?: StatTone;
  icon?: ReactNode;
}

export function StatPill({ label, value, tone = "reputation", icon }: StatPillProps) {
  return (
    <span className={`ui-stat-pill ui-stat-pill--${tone}`}>
      {icon}
      <span className="ui-stat-pill__label">{label}</span>
      <span className="ui-stat-pill__value text-number">{value}</span>
    </span>
  );
}
