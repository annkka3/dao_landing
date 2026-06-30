import { Card } from "../../../shared/ui/Card/Card";
import "./Profile.css";

export interface SeasonHistoryListProps {
  seasons: Array<{ season: string; result: string; rank: string }>;
}

export function SeasonHistoryList({ seasons }: SeasonHistoryListProps) {
  return (
    <Card className="season-history-list" title="История сезонов">
      {seasons.map((season) => (
        <div className="season-history-list__row" key={season.season}>
          <span>{season.season}</span>
          <strong>{season.result}</strong>
          <span className="text-number">{season.rank}</span>
        </div>
      ))}
    </Card>
  );
}
