import type { ReactNode } from "react";
import "./StatChangeList.css";

export interface StatChangeItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "positive" | "negative" | "neutral";
}

export interface StatChangeListProps {
  title?: ReactNode;
  items: StatChangeItem[];
}

export function StatChangeList({ title = "Changes from this choice", items }: StatChangeListProps) {
  return (
    <div className="game-stat-change-list">
      {title && <h3 className="game-stat-change-list__title">{title}</h3>}
      <ul className="game-stat-change-list__items">
        {items.map((item) => (
          <li className={`game-stat-change-list__item game-stat-change-list__item--${item.tone ?? "neutral"}`} key={item.id}>
            <span className="game-stat-change-list__label">
              {item.icon}
              {item.label}
            </span>
            <span className="game-stat-change-list__value text-number">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
