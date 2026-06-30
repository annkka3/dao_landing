import { StatBar, type StatTone } from "../../../../shared/ui/StatBar/StatBar";
import "./DailyRecap.css";

export interface DailyStatSummaryItem {
  label: string;
  value: number;
  delta: string;
  tone: StatTone;
}

export interface DailyStatSummaryProps {
  items: DailyStatSummaryItem[];
}

export function DailyStatSummary({ items }: DailyStatSummaryProps) {
  return (
    <div className="daily-stat-summary">
      {items.map((item) => (
        <StatBar key={item.label} change={item.delta} label={item.label} max={100} tone={item.tone} value={item.value} />
      ))}
    </div>
  );
}
