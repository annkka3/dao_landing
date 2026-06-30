import { Card } from "../../../../shared/ui/Card/Card";
import { StatBar, type StatTone } from "../../../../shared/ui/StatBar/StatBar";
import "./StatsPanel.css";

export interface StatsPanelItem {
  label: string;
  value: number;
  tone: StatTone;
}

export interface StatsPanelProps {
  title?: string;
  stats: StatsPanelItem[];
}

export function StatsPanel({ title = "Your stats", stats }: StatsPanelProps) {
  return (
    <Card className="stats-panel" title={title}>
      {stats.map((stat) => (
        <StatBar key={stat.label} label={stat.label} max={100} tone={stat.tone} value={stat.value} />
      ))}
    </Card>
  );
}
