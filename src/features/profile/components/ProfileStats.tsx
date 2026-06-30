import { Card } from "../../../shared/ui/Card/Card";
import "./Profile.css";

export interface ProfileStatsProps {
  stats: Array<{ label: string; value: string | number }>;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <Card className="profile-stats" title="Global stats">
      {stats.map((stat) => (
        <div className="profile-stats__item" key={stat.label}>
          <span>{stat.label}</span>
          <strong className="text-number">{stat.value}</strong>
        </div>
      ))}
    </Card>
  );
}
